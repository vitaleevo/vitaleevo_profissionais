module Api
  module V1
    class AccountController < BaseController
      def show
        service_requests = policy_scope(ServiceRequest).includes(:client, :professional, :service_category).recent.limit(5)
        payments = policy_scope(Payment).order(created_at: :desc).limit(5)

        render json: {
          data: {
            user: Api::V1::UserSerializer.call(current_user),
            recent_service_requests: service_requests.map { |request| Api::V1::ServiceRequestSerializer.call(request) },
            recent_payments: payments.map { |payment|
              Api::V1::PaymentSerializer.call(
                payment,
                include_financial_breakdown: current_user.operational? || current_user.professional?
              )
            }
          }
        }
      end
    end
  end
end
