class ServiceRequestsController < ApplicationController
  before_action :set_service_request, only: %i[show assign update_status]

  def index
    authorize ServiceRequest
    @service_requests = policy_scope(ServiceRequest).includes(:client, :professional, :service_category).recent
  end

  def show
    authorize @service_request
    @matches = MatchingService.new(@service_request).call(limit: 5)
  end

  def new
    authorize ServiceRequest
    @service_request = ServiceRequest.new(
      service_category_id: params[:service_category_id],
      scheduled_at: 1.day.from_now.change(min: 0),
      urgency: "normal"
    )
    @client = current_user.client? ? (current_user.client || Client.new(name: current_user.display_name, email: current_user.email)) : Client.new
    @categories = ServiceCategory.order(:name)
  end

  def create
    authorize ServiceRequest
    @categories = ServiceCategory.order(:name)
    @client = find_or_build_client
    @service_request = @client.service_requests.new(service_request_params)
    @service_request.budget_cents = params.dig(:service_request, :budget_aoa).to_i * 100

    if @client.save && @service_request.save
      Notification.create!(
        recipient_name: "Operacao",
        channel: "email",
        event: "new_request",
        title: "Novo pedido #{@service_request.code}",
        body: "#{@client.name} solicitou #{@service_request.service_category.name}."
      )
      redirect_to @service_request, notice: "Pedido criado. O matching ja esta pronto para analise."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def assign
    authorize @service_request, :assign?
    professional = Professional.find(params[:professional_id])
    @service_request.assign_to!(professional)

    Notification.create!(
      recipient_name: professional.name,
      channel: "sms",
      event: "assignment",
      title: "Nova ordem de servico",
      body: "Pedido #{@service_request.code} atribuido para #{professional.specialty}."
    )

    redirect_to @service_request, notice: "#{professional.name} foi atribuido ao pedido."
  end

  def update_status
    status = params.require(:status)
    authorize_status_update!(status)
    ServiceRequests::UpdateStatus.new(service_request: @service_request, status: status, user: current_user).call

    redirect_to @service_request, notice: "Estado atualizado para #{helpers.status_label(status)}."
  end

  private

  def set_service_request
    @service_request = ServiceRequest.includes(:client, :professional, :service_category, :payments).find(params[:id])
  end

  def authorize_status_update!(status)
    authorize @service_request, status == "completed" ? :complete? : :update_status?
  end

  def find_or_build_client
    if current_user.client?
      client = current_user.client || current_user.build_client
      client.assign_attributes(client_params.merge(email: current_user.email))
      return client
    end

    client = Client.find_or_initialize_by(phone: client_params[:phone])
    client.assign_attributes(client_params)
    client
  end

  def client_params
    params.require(:client).permit(:name, :phone, :email, :company_name, :address, :neighborhood, :latitude, :longitude)
  end

  def service_request_params
    params.require(:service_request).permit(
      :service_category_id,
      :title,
      :description,
      :location,
      :neighborhood,
      :latitude,
      :longitude,
      :urgency,
      :scheduled_at,
      *operator_only_service_request_params
    )
  end

  def operator_only_service_request_params
    current_user.operational? ? [ :operator_notes ] : []
  end
end
