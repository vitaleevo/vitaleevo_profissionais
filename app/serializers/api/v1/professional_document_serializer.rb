module Api
  module V1
    class ProfessionalDocumentSerializer
      def self.call(document)
        {
          id: document.id,
          professional_id: document.professional_id,
          kind: document.kind,
          status: document.status,
          original_filename: document.original_filename,
          content_type: document.content_type,
          byte_size: document.byte_size,
          review_notes: document.review_notes,
          reviewed_at: document.reviewed_at&.iso8601,
          reviewed_by: document.reviewed_by && {
            id: document.reviewed_by.id,
            name: document.reviewed_by.display_name
          },
          created_at: document.created_at.iso8601,
          updated_at: document.updated_at.iso8601
        }.compact
      end
    end
  end
end
