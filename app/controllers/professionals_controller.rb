class ProfessionalsController < ApplicationController
  def index
    authorize Professional
    @professionals = policy_scope(Professional).includes(:service_categories).active.order(rating: :desc, completed_jobs: :desc)
  end

  def show
    @professional = Professional.includes(:service_categories, service_requests: [ :client, :service_category ]).find(params[:id])
    authorize @professional
    @service_requests = policy_scope(ServiceRequest).where(professional_id: @professional.id).recent.limit(12)
  end
end
