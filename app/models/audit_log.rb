class AuditLog < ApplicationRecord
  ACTIONS = %w[
    professional_document.reviewed
    professional.operational_profile_updated
    service_request.assigned
    service_request.status_updated
  ].freeze

  belongs_to :actor, class_name: "User", optional: true
  belongs_to :auditable, polymorphic: true, optional: true

  validates :action, presence: true, inclusion: { in: ACTIONS }
  validate :metadata_is_object

  def self.record!(action:, actor: nil, auditable: nil, metadata: {})
    audit_log = create!(
      action: action,
      actor: actor,
      auditable: auditable,
      metadata: metadata.respond_to?(:to_h) ? metadata.to_h : {}
    )
    audit_log.send(:log_structured_event!)
    audit_log
  end

  private

  def log_structured_event!
    StructuredEventLog.info(
      "audit_log.recorded",
      audit_log_id: id,
      audit_action: action,
      actor_id: actor_id,
      actor_role: actor&.role,
      auditable_type: auditable_type,
      auditable_id: auditable_id,
      metadata: metadata
    )
  end

  def metadata_is_object
    errors.add(:metadata, "deve ser um objeto") unless metadata.is_a?(Hash)
  end
end
