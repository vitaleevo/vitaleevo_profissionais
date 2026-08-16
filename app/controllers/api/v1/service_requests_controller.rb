module Api
  module V1
    class ServiceRequestsController < BaseController
      before_action :set_service_request, only: %i[show matches assign update_status]

      def index
        authorize ServiceRequest
        service_requests = policy_scope(ServiceRequest).includes(:client, :professional, :service_category, :service_request_attachments)
        service_requests = service_requests.where(status: params[:status]) if params[:status].present?
        service_requests = service_requests.joins(:service_category).where(service_categories: { slug: params[:category_slug] }) if params[:category_slug].present?
        service_requests = service_requests.where(province: params[:province]) if params[:province].present?
        service_requests = service_requests.where(urgency: params[:urgency]) if params[:urgency].present?
        service_requests = current_user.operational? ? service_requests.operational_queue : service_requests.recent

        render json: {
          data: service_requests.map { |service_request| Api::V1::ServiceRequestSerializer.call(service_request) }
        }
      end

      def show
        authorize @service_request

        render json: {
          data: Api::V1::ServiceRequestSerializer.call(
            @service_request,
            detail: true,
            include_payments: true,
            include_payment_breakdown: include_payment_breakdown?,
            include_attachments: true,
            include_review: true
          )
        }
      end

      def create
        authorize ServiceRequest
        attachments = service_request_attachments
        if attachments.length > ServiceRequestAttachment::MAX_ATTACHMENTS_PER_REQUEST
          return render_error("too_many_attachments", "Envie no maximo 5 anexos por pedido.", :unprocessable_entity)
        end
        if attachments.sum { |uploaded_file| uploaded_file.respond_to?(:size) ? uploaded_file.size.to_i : 0 } > ServiceRequestAttachment::MAX_TOTAL_FILE_SIZE
          return render_error("attachments_too_large", "Os anexos do pedido devem ter no maximo 20 MB no total.", :unprocessable_entity)
        end
        return unless validate_service_request_attachments(attachments)
        budget_cents = requested_budget_cents
        return if performed?

        service_request = ServiceRequests::Create.new(
          user: current_user,
          client_attributes: client_params,
          request_attributes: service_request_params,
          budget_cents: budget_cents,
          attachments: attachments
        ).call

        created_request = ServiceRequest.includes(:client, :professional, :service_category, :service_request_attachments).find(service_request.id)

        render json: {
          data: Api::V1::ServiceRequestSerializer.call(
            created_request,
            detail: true,
            include_attachments: true
          )
        }, status: :created
      end

      def matches
        authorize @service_request, :show?
        limit = params.fetch(:limit, 5).to_i.clamp(1, 20)
        matches = MatchingService.new(@service_request).call(limit: limit)

        render json: {
          data: matches.map { |match|
            Api::V1::MatchSerializer.call(
              match,
              include_contact: current_user.operational?,
              include_coordinates: current_user.operational?
            )
          }
        }
      end

      def assign
        authorize @service_request, :assign?
        professional = Professional.find(params.require(:professional_id))
        ServiceRequests::Assign.new(service_request: @service_request, professional: professional, actor: current_user).call

        render json: {
          data: Api::V1::ServiceRequestSerializer.call(@service_request.reload, detail: true, include_attachments: true, include_review: true)
        }
      end

      def update_status
        status = params.require(:status)
        authorize_status_update!(status)
        ServiceRequests::UpdateStatus.new(service_request: @service_request, status: status, user: current_user).call

        render json: {
          data: Api::V1::ServiceRequestSerializer.call(
            @service_request.reload,
            detail: true,
            include_payments: true,
            include_payment_breakdown: include_payment_breakdown?,
            include_attachments: true,
            include_review: true
          )
        }
      end

      private

      def set_service_request
        @service_request = policy_scope(ServiceRequest).includes(:client, :professional, :service_category, :payments, :service_request_attachments, review: [ :client, :professional, :service_request ]).find(params[:id])
      end

      def authorize_status_update!(status)
        authorize @service_request, status == "completed" ? :complete? : :update_status?
      end

      def include_payment_breakdown?
        current_user.operational? || current_user.professional?
      end

      def client_params
        params.require(:client).permit(:name, :phone, :email, :company_name, :address, :province, :municipality, :neighborhood, :latitude, :longitude)
      end

      def service_request_params
        params.require(:service_request).permit(
          :service_category_id,
          :title,
          :description,
          :location,
          :province,
          :municipality,
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

      def requested_budget_cents
        request_params = params.require(:service_request)
        if request_params[:budget_cents].present?
          return request_params[:budget_cents].to_i if current_user.operational?

          return render_error("internal_budget_not_allowed", "Campo de orcamento interno nao permitido.", :unprocessable_entity)
        end

        request_params[:budget_aoa].to_i * 100
      end

      def service_request_attachments
        Array(params[:attachments]).reject(&:blank?)
      end

      def validate_service_request_attachments(attachments)
        attachments.each do |uploaded_file|
          unless uploaded_file.respond_to?(:size)
            render_error("invalid_attachment", "Anexo invalido.", :unprocessable_entity)
            return false
          end

          if uploaded_file.size.to_i > ServiceRequestAttachment::MAX_FILE_SIZE
            render_error("attachment_too_large", "Cada anexo deve ter no maximo 8 MB.", :unprocessable_entity)
            return false
          end

          unless UploadSafety.allowed_content_type?(uploaded_file, ServiceRequestAttachment::ALLOWED_CONTENT_TYPES)
            render_error("invalid_attachment_type", "Anexo deve ser PDF, JPG, PNG ou WebP.", :unprocessable_entity)
            return false
          end
        end

        true
      end
    end
  end
end
