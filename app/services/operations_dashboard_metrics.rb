class OperationsDashboardMetrics
  RISK_STATUSES = %w[pending assigned accepted in_progress disputed].freeze
  OPEN_SLA_STATUSES = %w[pending assigned accepted in_progress].freeze
  URGENT_URGENCIES = %w[urgent priority].freeze
  RESPONSE_WINDOW = 30.days
  PENDING_RESPONSE_TARGET = 2.hours
  ASSIGNED_ACCEPTANCE_TARGET = 4.hours
  URGENT_DUE_SOON_WINDOW = 2.hours
  RISK_ALERT_LIMIT = 5

  def initialize(requests_scope:, now: Time.current)
    @requests_scope = requests_scope
    @now = now
  end

  def call
    overdue_count = overdue_requests.count
    sla_risk_count = sla_risk_requests.distinct.count
    recent_terminal_count = recent_terminal_requests.count
    completed_recent_count = recent_terminal_requests.where(status: "completed").count
    disputed_recent_count = recent_terminal_requests.where(status: "disputed").count
    completed_count = completed_requests.count
    reviewed_completed_count = completed_requests.joins(:review).distinct.count
    response_minutes = average_response_minutes
    completion_rate = percentage(completed_recent_count, recent_terminal_count)
    dispute_rate = percentage(disputed_recent_count, recent_terminal_count)

    {
      service_quality: {
        status: service_quality_status(
          overdue_count: overdue_count,
          sla_risk_count: sla_risk_count,
          completion_rate_percent: completion_rate,
          dispute_rate_percent: dispute_rate,
          average_response_minutes: response_minutes
        ),
        generated_at: now.iso8601,
        overdue_requests_count: overdue_count,
        sla_risk_requests_count: sla_risk_count,
        average_response_minutes: response_minutes,
        completion_rate_percent: completion_rate,
        dispute_rate_percent: dispute_rate,
        average_quality_rating: average_quality_rating,
        review_coverage_percent: percentage(reviewed_completed_count, completed_count)
      },
      risk_alerts: risk_alerts
    }
  end

  private

  attr_reader :requests_scope, :now

  def overdue_requests
    requests_scope
      .where(status: OPEN_SLA_STATUSES)
      .where.not(scheduled_at: nil)
      .where("scheduled_at < ?", now)
  end

  def sla_risk_requests
    requests_scope
      .where(status: OPEN_SLA_STATUSES)
      .where(
        <<~SQL.squish,
          (status = :pending_status AND created_at <= :pending_deadline)
          OR (status = :assigned_status AND updated_at <= :assigned_deadline)
          OR (scheduled_at IS NOT NULL AND scheduled_at < :now)
          OR (
            status IN (:urgent_statuses)
            AND urgency IN (:urgent_urgencies)
            AND scheduled_at IS NOT NULL
            AND scheduled_at <= :urgent_due_soon
          )
        SQL
        pending_status: "pending",
        pending_deadline: now - PENDING_RESPONSE_TARGET,
        assigned_status: "assigned",
        assigned_deadline: now - ASSIGNED_ACCEPTANCE_TARGET,
        now: now,
        urgent_statuses: %w[pending assigned accepted],
        urgent_urgencies: URGENT_URGENCIES,
        urgent_due_soon: now + URGENT_DUE_SOON_WINDOW
      )
  end

  def risk_alerts
    requests_scope
      .where(status: RISK_STATUSES)
      .includes(:service_category)
      .order(Arel.sql(ServiceRequest::OPERATIONAL_QUEUE_ORDER_SQL))
      .limit(200)
      .map { |request| risk_alert_for(request) }
      .compact
      .sort_by { |alert| [ -alert[:score], -alert[:age_minutes] ] }
      .first(RISK_ALERT_LIMIT)
      .map { |alert| alert.except(:score) }
  end

  def risk_alert_for(request)
    reason = risk_reason(request)
    return unless reason

    {
      id: request.id,
      code: request.code,
      title: request.title,
      status: request.status,
      urgency: request.urgency,
      province: request.province,
      service_category_name: request.service_category.name,
      scheduled_at: request.scheduled_at&.iso8601,
      age_minutes: ((now - request.created_at) / 60).floor,
      risk_level: risk_level(request),
      reason: reason,
      score: risk_score(request)
    }
  end

  def risk_reason(request)
    return "Caso em disputa requer decisao operacional." if request.status == "disputed"
    return "Horario agendado ja passou sem conclusao." if request.scheduled_at.present? && request.scheduled_at < now
    return "Pedido pendente ha mais de 2 horas." if request.status == "pending" && request.created_at <= now - PENDING_RESPONSE_TARGET
    return "Atribuicao sem aceite ha mais de 4 horas." if request.status == "assigned" && request.updated_at <= now - ASSIGNED_ACCEPTANCE_TARGET

    if URGENT_URGENCIES.include?(request.urgency) && request.scheduled_at.present? && request.scheduled_at <= now + URGENT_DUE_SOON_WINDOW
      return "Urgencia proxima do horario agendado."
    end

    nil
  end

  def risk_level(request)
    return "critical" if request.status == "disputed"
    return "critical" if request.scheduled_at.present? && request.scheduled_at < now
    return "high" if request.urgency == "priority"
    return "high" if request.status == "pending" && request.created_at <= now - PENDING_RESPONSE_TARGET

    "medium"
  end

  def risk_score(request)
    base = { "critical" => 300, "high" => 200, "medium" => 100 }.fetch(risk_level(request), 0)
    urgency_bonus = { "priority" => 30, "urgent" => 20, "normal" => 0 }.fetch(request.urgency, 0)
    age_bonus = ((now - request.created_at) / 1.hour).floor.clamp(0, 72)

    base + urgency_bonus + age_bonus
  end

  def recent_terminal_requests
    requests_scope
      .where(status: %w[completed cancelled disputed])
      .where("updated_at >= ?", now - RESPONSE_WINDOW)
  end

  def completed_requests
    requests_scope.where(status: "completed")
  end

  def response_samples
    requests_scope
      .where.not(accepted_at: nil)
      .where("accepted_at >= ?", now - RESPONSE_WINDOW)
      .pluck(:created_at, :accepted_at)
  end

  def average_response_minutes
    samples = response_samples
    return nil if samples.empty?

    minutes = samples.map { |created_at, accepted_at| (accepted_at - created_at) / 60 }
    (minutes.sum / minutes.size).round
  end

  def average_quality_rating
    average = Review.where(service_request_id: completed_requests.select(:id)).average(:quality)
    average&.to_f&.round(2)
  end

  def percentage(value, total)
    return nil if total.to_i.zero?

    ((value.to_f / total) * 100).round
  end

  def service_quality_status(overdue_count:, sla_risk_count:, completion_rate_percent:, dispute_rate_percent:, average_response_minutes:)
    return "critical" if overdue_count.positive? || dispute_rate_percent.to_i >= 15
    return "attention" if sla_risk_count.positive?
    return "attention" if average_response_minutes.to_i > 120
    return "attention" if completion_rate_percent && completion_rate_percent < 75

    "healthy"
  end
end
