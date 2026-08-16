module Api
  module V1
    class AuditLogSerializer
      def self.call(audit_log)
        {
          id: audit_log.id,
          action: audit_log.action,
          actor: audit_log.actor && {
            id: audit_log.actor.id,
            name: audit_log.actor.display_name,
            role: audit_log.actor.role
          },
          auditable_type: audit_log.auditable_type,
          auditable_id: audit_log.auditable_id,
          metadata: audit_log.metadata,
          created_at: audit_log.created_at.iso8601
        }.compact
      end
    end
  end
end
