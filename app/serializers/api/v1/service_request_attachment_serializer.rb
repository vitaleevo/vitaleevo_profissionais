module Api
  module V1
    class ServiceRequestAttachmentSerializer
      def self.call(attachment)
        {
          id: attachment.id,
          service_request_id: attachment.service_request_id,
          original_filename: attachment.original_filename,
          content_type: attachment.content_type,
          byte_size: attachment.byte_size,
          created_at: attachment.created_at.iso8601
        }
      end
    end
  end
end
