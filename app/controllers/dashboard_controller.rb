class DashboardController < ApplicationController
  def index
    authorize :dashboard, :index?

    requests_scope = policy_scope(ServiceRequest)
    professionals_scope = policy_scope(Professional)
    payments_scope = policy_scope(Payment)

    @stats = {
      revenue_cents: payments_scope.where(status: "paid").sum(:amount_cents),
      commission_cents: payments_scope.where(status: "paid").sum(:commission_cents),
      requests: requests_scope.count,
      open_requests: requests_scope.open.count,
      professionals_online: professionals_scope.where(status: "online").count,
      professionals_verified: professionals_scope.where(documents_status: "verified").count
    }

    @recent_requests = requests_scope.includes(:client, :service_category, :professional).recent.limit(8)
    @top_professionals = professionals_scope.includes(:service_categories).active.order(rating: :desc, completed_jobs: :desc).limit(6)
    @categories = ServiceCategory.order(:name)
    @matching_preview_request = requests_scope.where(status: "pending").includes(:service_category).recent.first
    @matching_preview = @matching_preview_request ? MatchingService.new(@matching_preview_request).call(limit: 3) : []
  end
end
