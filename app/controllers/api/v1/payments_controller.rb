module Api
  module V1
    class PaymentsController < BaseController
      def index
        payments = policy_scope(Payment).includes(service_request: [ :client, :service_category, :professional ]).order(created_at: :desc)

        render json: {
          data: payments.map { |payment| serialize_payment_with_request(payment) }
        }
      end

      private

      def serialize_payment_with_request(payment)
        Api::V1::PaymentSerializer.call(
          payment,
          include_financial_breakdown: current_user.operational? || current_user.professional?
        ).merge(
          service_request: Api::V1::ServiceRequestSerializer.call(payment.service_request)
        )
      end
    end
  end
end
