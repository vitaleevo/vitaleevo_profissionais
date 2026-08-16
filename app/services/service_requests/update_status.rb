module ServiceRequests
  class UpdateStatus
    STATUS_TIMESTAMPS = {
      "accepted" => :accepted_at,
      "in_progress" => :started_at,
      "completed" => :completed_at
    }.freeze
    PROFESSIONAL_STATUSES = %w[accepted in_progress cancelled disputed].freeze

    def initialize(service_request:, status:, user:)
      @service_request = service_request
      @status = status.to_s
      @user = user
    end

    def call
      authorize_status!

      ActiveRecord::Base.transaction do
        previous_status = service_request.status
        service_request.update!(status_attributes)
        record_status_update!(previous_status)
        create_payment_for_completed_request if operational_completion?
      end

      service_request
    end

    private

    attr_reader :service_request, :status, :user

    def authorize_status!
      return if user&.operational?
      return if eligible_assigned_professional? && PROFESSIONAL_STATUSES.include?(status)

      raise Pundit::NotAuthorizedError, "Nao autorizado a atualizar este estado."
    end

    def eligible_assigned_professional?
      user&.professional? &&
        user.professional&.publicly_listed? &&
        service_request.professional_id == user.professional.id
    end

    def operational_completion?
      user&.operational? && status == "completed"
    end

    def status_attributes
      timestamp = STATUS_TIMESTAMPS[status]
      attrs = { status: status }
      attrs[timestamp] = Time.current if timestamp
      attrs
    end

    def create_payment_for_completed_request
      return if service_request.payments.exists?(status: "paid")

      amount = service_request.budget_cents.positive? ? service_request.budget_cents : service_request.service_category.base_price_cents
      service_request.payments.create!(amount_cents: amount, status: "paid", paid_at: Time.current)
    end

    def record_status_update!(previous_status)
      AuditLog.record!(
        action: "service_request.status_updated",
        actor: user,
        auditable: service_request,
        metadata: {
          previous_status: previous_status,
          next_status: service_request.status
        }
      )
    end
  end
end
