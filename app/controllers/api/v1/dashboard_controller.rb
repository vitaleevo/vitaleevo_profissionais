module Api
  module V1
    class DashboardController < BaseController
      def show
        authorize :dashboard, :index?

        requests_scope = policy_scope(ServiceRequest)
        professionals_scope = policy_scope(Professional)
        payments_scope = policy_scope(Payment)
        matching_preview_request = requests_scope.where(status: "pending").includes(:service_category).recent.first
        operations_metrics = OperationsDashboardMetrics.new(requests_scope: requests_scope).call
        service_quality = operations_metrics.fetch(:service_quality)
        audit_logs = recent_audit_logs
        return if performed?

        render json: {
          data: {
            stats: {
              revenue_cents: payments_scope.where(status: "paid").sum(:amount_cents),
              commission_cents: payments_scope.where(status: "paid").sum(:commission_cents),
              requests_count: requests_scope.count,
              open_requests_count: requests_scope.open.count,
              pending_requests_count: requests_scope.where(status: "pending").count,
              assigned_requests_count: requests_scope.where(status: "assigned").count,
              in_work_requests_count: requests_scope.where(status: %w[assigned accepted in_progress]).count,
              disputed_requests_count: requests_scope.where(status: "disputed").count,
              professionals_online_count: professionals_scope.where(status: "online").count,
              professionals_verified_count: professionals_scope.where(documents_status: "verified").count,
              professionals_available_count: professionals_scope.where(status: "online", documents_status: "verified").count,
              professionals_pending_docs_count: professionals_scope.where(documents_status: "pending").count,
              professionals_rejected_docs_count: professionals_scope.where(documents_status: "rejected").count,
              overdue_requests_count: service_quality[:overdue_requests_count],
              sla_risk_requests_count: service_quality[:sla_risk_requests_count],
              average_response_minutes: service_quality[:average_response_minutes],
              completion_rate_percent: service_quality[:completion_rate_percent],
              dispute_rate_percent: service_quality[:dispute_rate_percent],
              average_quality_rating: service_quality[:average_quality_rating],
              review_coverage_percent: service_quality[:review_coverage_percent]
            },
            service_quality: service_quality,
            risk_alerts: operations_metrics.fetch(:risk_alerts),
            recent_requests: requests_scope.includes(:client, :service_category, :professional).recent.limit(8).map { |request|
              Api::V1::ServiceRequestSerializer.call(request)
            },
            top_professionals: professionals_scope.includes(:service_categories).active.order(rating: :desc, completed_jobs: :desc).limit(6).map { |professional|
              Api::V1::ProfessionalSerializer.call(professional, include_contact: true, include_coordinates: true)
            },
            categories: ServiceCategory.order(:name).map { |category| Api::V1::ServiceCategorySerializer.call(category) },
            territorial_coverage: AngolaLocations.province_coverage(
              professionals_scope: professionals_scope,
              requests_scope: requests_scope
            ),
            matching_preview_request: matching_preview_request && Api::V1::ServiceRequestSerializer.call(matching_preview_request),
            matching_preview: matching_preview_request ? MatchingService.new(matching_preview_request).call(limit: 3).map { |match|
              Api::V1::MatchSerializer.call(match, include_contact: true, include_coordinates: true)
            } : [],
            audit_actions: AuditLog::ACTIONS,
            recent_audit_logs: audit_logs.map { |audit_log| Api::V1::AuditLogSerializer.call(audit_log) }
          }
        }
      end

      private

      def recent_audit_logs
        scope = AuditLog.includes(:actor).order(created_at: :desc)
        return scope.limit(12) if params[:audit_action].blank?

        return scope.where(action: params[:audit_action]).limit(12) if AuditLog::ACTIONS.include?(params[:audit_action])

        render_error("invalid_audit_action", "Tipo de auditoria invalido.", :unprocessable_entity)
        AuditLog.none
      end
    end
  end
end
