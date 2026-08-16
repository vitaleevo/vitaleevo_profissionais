module Api
  module V1
    class PaymentSerializer
      def self.call(payment, include_financial_breakdown: false)
        data = {
          id: payment.id,
          service_request_id: payment.service_request_id,
          amount_cents: payment.amount_cents,
          method: payment.method,
          status: payment.status,
          paid_at: payment.paid_at&.iso8601,
          created_at: payment.created_at.iso8601
        }

        if include_financial_breakdown
          data[:commission_cents] = payment.commission_cents
          data[:professional_payout_cents] = payment.professional_payout_cents
        end

        data
      end
    end
  end
end
