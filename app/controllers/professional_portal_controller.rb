class ProfessionalPortalController < ApplicationController
  before_action :require_professional_user
  before_action :set_professional

  def dashboard
    @next_request = @professional.service_requests.open.order(scheduled_at: :asc).first
    @today_requests = @professional.service_requests.where(scheduled_at: Time.current.beginning_of_day..Time.current.end_of_day).recent
    @recent_requests = @professional.service_requests.includes(:client, :service_category).recent.limit(5)
    @paid_payments = Payment.joins(:service_request).where(service_requests: { professional_id: @professional.id }, status: "paid")
  end

  def wallet
    @payments = Payment.joins(:service_request).where(service_requests: { professional_id: @professional.id }).order(created_at: :desc)
    @paid_total_cents = @payments.where(status: "paid").sum(:professional_payout_cents)
    @commission_cents = @payments.where(status: "paid").sum(:commission_cents)
  end

  def history
    @service_requests = @professional.service_requests.includes(:client, :service_category, :payments).recent
  end

  def jobs
    @available_requests = ServiceRequest.includes(:client, :service_category)
      .where(status: "pending", service_category_id: @professional.service_category_ids)
      .recent
  end

  def registration
  end

  private

  def require_professional_user
    redirect_to root_path, alert: "Area exclusiva para profissionais." unless current_user.professional?
  end

  def set_professional
    @professional = current_user.professional
    redirect_to root_path, alert: "Complete o cadastro profissional para acessar esta area." unless @professional
  end
end
