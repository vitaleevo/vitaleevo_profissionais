module Api
  module V1
    class ReviewSerializer
      def self.call(review, public_view: false)
        {
          id: review.id,
          quality: review.quality,
          punctuality: review.punctuality,
          communication: review.communication,
          comment: review.comment,
          created_at: review.created_at.iso8601,
          client: serialize_client(review, public_view: public_view),
          professional: ProfessionalSerializer.call(review.professional),
          service_request: serialize_service_request(review, public_view: public_view)
        }
      end

      def self.serialize_client(review, public_view:)
        return { id: review.client_id, name: "Cliente verificado" } if public_view

        ClientSerializer.call(review.client, include_private: false)
      end

      def self.serialize_service_request(review, public_view:)
        payload = {
          id: review.service_request_id,
          title: review.service_request.title
        }
        payload[:code] = review.service_request.code unless public_view
        payload
      end
      private_class_method :serialize_client
      private_class_method :serialize_service_request
    end
  end
end
