module Api
  module V1
    class ProfessionalPortalController < BaseController
      SELF_SERVICE_STATUSES = %w[online offline occupied].freeze

      before_action :require_professional_user
      before_action :set_professional, except: :upsert_profile
      before_action :require_publicly_listed_professional!, only: %i[dashboard wallet history jobs]

      def dashboard
        next_request = @professional.service_requests.open.order(scheduled_at: :asc).first
        today_requests = @professional.service_requests.where(scheduled_at: Time.current.beginning_of_day..Time.current.end_of_day).recent
        recent_requests = @professional.service_requests.includes(:client, :service_category, :payments).recent.limit(5)
        paid_payments = professional_payments.where(status: "paid")

        render json: {
          data: {
            professional: Api::V1::ProfessionalSerializer.call(@professional, detail: true, include_contact: true, include_coordinates: true),
            stats: {
              paid_total_cents: paid_payments.sum(:professional_payout_cents),
              active_requests_count: @professional.service_requests.open.count,
              completed_jobs_count: @professional.completed_jobs,
              average_rating: @professional.rating.to_f
            },
            next_request: next_request && Api::V1::ServiceRequestSerializer.call(next_request, detail: true),
            today_requests: today_requests.map { |request| Api::V1::ServiceRequestSerializer.call(request) },
            recent_requests: recent_requests.map { |request|
              Api::V1::ServiceRequestSerializer.call(request, include_payments: true, include_payment_breakdown: true)
            }
          }
        }
      end

      def wallet
        payments = professional_payments.order(created_at: :desc)

        render json: {
          data: {
            payments: payments.map { |payment| Api::V1::PaymentSerializer.call(payment, include_financial_breakdown: true) },
            totals: {
              paid_total_cents: payments.where(status: "paid").sum(:professional_payout_cents),
              commission_cents: payments.where(status: "paid").sum(:commission_cents),
              transactions_count: payments.count
            }
          }
        }
      end

      def history
        service_requests = @professional.service_requests.includes(:client, :service_category, :payments).recent

        render json: {
          data: service_requests.map { |request|
            Api::V1::ServiceRequestSerializer.call(request, detail: true, include_payments: true, include_payment_breakdown: true)
          }
        }
      end

      def jobs
        available_requests = ServiceRequest.includes(:client, :service_category)
          .where(status: "pending", service_category_id: @professional.service_category_ids)
          .recent

        render json: {
          data: available_requests.map { |request|
            Api::V1::ServiceRequestSerializer.call(
              request,
              detail: true,
              include_client_private: false,
              include_client_identity: false
            )
          }
        }
      end

      def profile
        render json: {
          data: Api::V1::ProfessionalSerializer.call(@professional, detail: true, include_contact: true, include_coordinates: true, include_documents: true)
        }
      end

      def upsert_profile
        professional = current_user.professional || current_user.build_professional
        authorize professional, professional.persisted? ? :update? : :create?
        new_profile = professional.new_record?

        professional.assign_attributes(professional_profile_params)
        professional.status = "offline" if professional.status.blank?
        professional.documents_status = "pending" if professional.documents_status.blank?
        validate_self_service_status!(professional)

        ActiveRecord::Base.transaction do
          professional.save!
          sync_service_categories(professional)
        end

        profile = Professional.includes(:service_categories, professional_documents: :reviewed_by).find(professional.id)

        render json: {
          data: Api::V1::ProfessionalSerializer.call(profile, detail: true, include_contact: true, include_coordinates: true, include_documents: true)
        }, status: new_profile ? :created : :ok
      end

      private

      def require_professional_user
        return if current_user.professional?

        render_error("forbidden", "Area exclusiva para profissionais.", :forbidden)
      end

      def set_professional
        @professional = Professional.includes(:service_categories, professional_documents: :reviewed_by).find_by(user_id: current_user.id)
        return if @professional

        render_error("profile_required", "Complete o cadastro profissional para acessar esta area.", :forbidden)
      end

      def require_publicly_listed_professional!
        return true if @professional.publicly_listed?

        render_error("professional_not_verified", "Apenas profissionais verificados podem acessar esta area operacional.", :forbidden)
        false
      end

      def professional_payments
        Payment.joins(:service_request).where(service_requests: { professional_id: @professional.id })
      end

      def professional_payload
        @professional_payload ||= params.require(:professional).permit(
          :name,
          :phone,
          :email,
          :specialty,
          :bio,
          :location,
          :province,
          :municipality,
          :neighborhood,
          :hourly_rate_cents,
          :experience_years,
          :response_minutes,
          :status,
          service_category_ids: []
        )
      end

      def professional_profile_params
        professional_payload.except(:service_category_ids)
      end

      def sync_service_categories(professional)
        return unless professional_payload.key?(:service_category_ids)

        professional.service_category_ids = ServiceCategory.where(id: requested_service_category_ids).pluck(:id)
      end

      def requested_service_category_ids
        Array(professional_payload[:service_category_ids]).reject(&:blank?)
      end

      def validate_self_service_status!(professional)
        return if SELF_SERVICE_STATUSES.include?(professional.status)

        professional.errors.add(:status, "nao pode ser alterado para este estado")
        raise ActiveRecord::RecordInvalid, professional
      end
    end
  end
end
