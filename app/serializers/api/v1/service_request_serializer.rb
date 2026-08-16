module Api
  module V1
    class ServiceRequestSerializer
      def self.call(service_request, detail: false, include_payments: false, include_payment_breakdown: false, include_client_private: true, include_client_identity: true, include_attachments: false, include_review: false)
        data = {
          id: service_request.id,
          code: service_request.code,
          title: service_request.title,
          description: detail ? service_request.description : nil,
          status: service_request.status,
          urgency: service_request.urgency,
          location: service_request.location,
          province: attribute_for(service_request, :province),
          municipality: attribute_for(service_request, :municipality),
          neighborhood: service_request.neighborhood,
          budget_cents: service_request.budget_cents,
          scheduled_at: service_request.scheduled_at&.iso8601,
          accepted_at: service_request.accepted_at&.iso8601,
          started_at: service_request.started_at&.iso8601,
          completed_at: service_request.completed_at&.iso8601,
          created_at: service_request.created_at.iso8601,
          service_category: ServiceCategorySerializer.call(service_request.service_category),
          client: ClientSerializer.call(
            service_request.client,
            include_private: include_client_private,
            include_identity: include_client_identity
          ),
          professional: serialize_professional(service_request)
        }.compact

        if include_payments
          data[:payments] = service_request.payments.map { |payment|
            PaymentSerializer.call(payment, include_financial_breakdown: include_payment_breakdown)
          }
        end

        if include_attachments
          data[:attachments] = service_request.service_request_attachments.map { |attachment|
            ServiceRequestAttachmentSerializer.call(attachment)
          }
        end

        if include_review && service_request.review
          data[:review] = ReviewSerializer.call(service_request.review)
        end

        data
      end

      def self.serialize_professional(service_request)
        return unless service_request.professional

        ProfessionalSerializer.call(service_request.professional, detail: false, include_contact: true)
      end

      def self.attribute_for(record, name)
        return nil unless record.has_attribute?(name)

        record.public_send(name)
      end
      private_class_method :serialize_professional
      private_class_method :attribute_for
    end
  end
end
