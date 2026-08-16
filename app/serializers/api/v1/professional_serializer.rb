module Api
  module V1
    class ProfessionalSerializer
      def self.call(professional, detail: false, include_contact: false, include_coordinates: false, include_documents: false, include_operational_profile: false)
        data = {
          id: professional.id,
          name: professional.name,
          specialty: professional.specialty,
          bio: detail ? professional.bio : nil,
          province: attribute_for(professional, :province),
          municipality: attribute_for(professional, :municipality),
          location: professional.location,
          neighborhood: professional.neighborhood,
          status: professional.status,
          documents_status: professional.documents_status,
          experience_years: professional.experience_years,
          hourly_rate_cents: professional.hourly_rate_cents,
          rating: professional.rating.to_f,
          quality_rating: professional.quality_rating.to_f,
          punctuality_rating: professional.punctuality_rating.to_f,
          communication_rating: professional.communication_rating.to_f,
          completed_jobs: professional.completed_jobs,
          response_minutes: professional.response_minutes,
          service_categories: serialize_categories(professional)
        }.compact

        data[:contact] = { phone: professional.phone, email: professional.email } if include_contact
        data[:coordinates] = { latitude: professional.latitude, longitude: professional.longitude } if include_coordinates
        data[:documents] = serialize_documents(professional) if include_documents
        if include_operational_profile
          data[:operator_notes] = attribute_for(professional, :operator_notes)
          data[:operational_activity] = serialize_operational_activity(professional)
        end
        data
      end

      def self.serialize_categories(professional)
        return [] unless professional.association(:service_categories).loaded?

        professional.service_categories.map { |category| ServiceCategorySerializer.call(category) }
      end

      def self.attribute_for(record, name)
        return nil unless record.has_attribute?(name)

        record.public_send(name)
      end

      def self.serialize_documents(professional)
        return [] unless professional.association(:professional_documents).loaded?

        professional.professional_documents.sort_by(&:created_at).reverse.map { |document| ProfessionalDocumentSerializer.call(document) }
      end

      def self.serialize_operational_activity(professional)
        document_activity_ids = AuditLog
          .where(action: "professional_document.reviewed")
          .where("metadata ->> 'professional_id' = ?", professional.id.to_s)
          .order(created_at: :desc)
          .limit(12)
          .pluck(:id)
        request_activity_ids = AuditLog
          .where(auditable_type: "ServiceRequest", auditable_id: professional.service_requests.select(:id))
          .order(created_at: :desc)
          .limit(12)
          .pluck(:id)
        profile_activity_ids = AuditLog
          .where(action: "professional.operational_profile_updated", auditable: professional)
          .order(created_at: :desc)
          .limit(12)
          .pluck(:id)

        AuditLog
          .where(id: (document_activity_ids + request_activity_ids + profile_activity_ids).uniq)
          .includes(:actor)
          .order(created_at: :desc)
          .limit(12)
          .map { |audit_log| AuditLogSerializer.call(audit_log) }
      end
      private_class_method :serialize_categories
      private_class_method :attribute_for
      private_class_method :serialize_documents
      private_class_method :serialize_operational_activity
    end
  end
end
