require "test_helper"
require "stringio"

class AuditLogTest < ActiveSupport::TestCase
  test "records allowed action with optional actor and auditable target" do
    audit_log = AuditLog.record!(
      action: "service_request.status_updated",
      metadata: { previous_status: "pending", next_status: "assigned" }
    )

    assert audit_log.persisted?
    assert_nil audit_log.actor
    assert_nil audit_log.auditable
    assert_equal "pending", audit_log.metadata.fetch("previous_status")
  end

  test "rejects unknown action" do
    audit_log = AuditLog.new(action: "unknown.action", metadata: {})

    assert_not audit_log.valid?
    assert_includes audit_log.errors[:action], "is not included in the list"
  end

  test "emits structured runtime event when recorded" do
    io = StringIO.new
    logger = ActiveSupport::Logger.new(io)
    previous_logger = Rails.logger

    begin
      Rails.logger = logger
      AuditLog.record!(
        action: "service_request.status_updated",
        actor: users(:admin),
        metadata: { previous_status: "assigned", next_status: "accepted", token: "secret" }
      )
    ensure
      Rails.logger = previous_logger
    end

    payload = JSON.parse(io.string.lines.last)
    assert_equal "audit_log.recorded", payload.fetch("event")
    assert_equal "service_request.status_updated", payload.fetch("audit_action")
    assert_equal users(:admin).id, payload.fetch("actor_id")
    assert_equal "admin", payload.fetch("actor_role")
    assert_equal "assigned", payload.dig("metadata", "previous_status")
    assert_equal StructuredEventLog::FILTERED, payload.dig("metadata", "token")
  end
end
