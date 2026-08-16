module Api
  module V1
    class ProfessionalDocumentsController < BaseController
      ALLOWED_CONTENT_TYPES = %w[application/pdf image/jpeg image/png image/webp].freeze
      MAX_FILE_SIZE = 8.megabytes
      REVIEW_STATUSES = %w[approved rejected].freeze

      def index
        professional = current_user.professional
        return render_error("profile_required", "Complete o cadastro profissional para enviar documentos.", :forbidden) unless professional

        documents = policy_scope(ProfessionalDocument)
          .where(professional: professional)
          .with_attached_file
          .includes(:reviewed_by)
          .recent

        authorize ProfessionalDocument

        render json: {
          data: documents.map { |document| Api::V1::ProfessionalDocumentSerializer.call(document) }
        }
      end

      def create
        professional = current_user.professional
        return render_error("profile_required", "Complete o cadastro profissional para enviar documentos.", :forbidden) unless professional

        uploaded_file = params.require(:file)
        detected_content_type = validate_uploaded_file(uploaded_file)
        return unless detected_content_type

        document = professional.professional_documents.build(
          kind: document_kind,
          original_filename: uploaded_file.original_filename,
          content_type: detected_content_type,
          byte_size: uploaded_file.size,
          status: "pending"
        )
        document.file.attach(uploaded_file)
        authorize document

        ActiveRecord::Base.transaction do
          document.save!
          ProfessionalDocument.refresh_professional_status!(professional)
        end

        render json: {
          data: Api::V1::ProfessionalDocumentSerializer.call(document)
        }, status: :created
      end

      def review
        document = ProfessionalDocument.includes(:professional, :reviewed_by).find(params[:id])
        authorize document, :review?

        status = review_status
        return render_error("invalid_status", "Estado de revisao invalido.", :unprocessable_entity) unless REVIEW_STATUSES.include?(status)

        previous_status = document.status
        professional = document.professional
        previous_professional_documents_status = professional.documents_status
        document.assign_attributes(
          status: status,
          review_notes: review_notes,
          reviewed_by: current_user,
          reviewed_at: Time.current
        )

        ActiveRecord::Base.transaction do
          document.save!
          ProfessionalDocument.refresh_professional_status!(professional)
          AuditLog.record!(
            action: "professional_document.reviewed",
            actor: current_user,
            auditable: document,
            metadata: {
              professional_id: professional.id,
              document_kind: document.kind,
              previous_status: previous_status,
              next_status: document.status,
              previous_professional_documents_status: previous_professional_documents_status,
              next_professional_documents_status: professional.reload.documents_status
            }
          )
        end

        render json: {
          data: Api::V1::ProfessionalDocumentSerializer.call(document.reload)
        }
      end

      private

      def document_kind
        params[:kind].presence || params.dig(:professional_document, :kind)
      end

      def review_status
        params[:status].presence || params.dig(:professional_document, :status)
      end

      def review_notes
        params[:review_notes].presence || params.dig(:professional_document, :review_notes)
      end

      def validate_uploaded_file(uploaded_file)
        unless uploaded_file.respond_to?(:size)
          render_error("invalid_file", "Documento invalido.", :unprocessable_entity)
          return false
        end

        if uploaded_file.size.to_i > MAX_FILE_SIZE
          render_error("file_too_large", "Documento deve ter no maximo 8 MB.", :unprocessable_entity)
          return false
        end

        unless UploadSafety.allowed_content_type?(uploaded_file, ALLOWED_CONTENT_TYPES)
          render_error("invalid_file_type", "Documento deve ser PDF, JPG, PNG ou WebP.", :unprocessable_entity)
          return false
        end

        UploadSafety.signature_content_type(uploaded_file)
      end
    end
  end
end
