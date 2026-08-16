require "test_helper"
require "stringio"

class StructuredEventLogTest < ActiveSupport::TestCase
  test "writes json event with current request context" do
    user = users(:client)
    Current.request_id = "req-123"
    Current.user = user

    payload = capture_structured_log do
      StructuredEventLog.info("test.event", feature: "observability")
    end

    assert_equal "test.event", payload.fetch("event")
    assert_equal "req-123", payload.fetch("request_id")
    assert_equal user.id, payload.fetch("actor_id")
    assert_equal "client", payload.fetch("actor_role")
    assert_equal "observability", payload.fetch("feature")
    assert payload.fetch("emitted_at").present?
  ensure
    Current.reset
  end

  test "filters sensitive keys recursively" do
    payload = capture_structured_log do
      StructuredEventLog.info(
        "test.sensitive",
        email: "cliente@example.com",
        metadata: {
          visible: "ok",
          auth_token: "secret",
          nested: [
            { password: "secret" }
          ]
        }
      )
    end

    assert_equal StructuredEventLog::FILTERED, payload.fetch("email")
    assert_equal "ok", payload.dig("metadata", "visible")
    assert_equal StructuredEventLog::FILTERED, payload.dig("metadata", "auth_token")
    assert_equal StructuredEventLog::FILTERED, payload.dig("metadata", "nested", 0, "password")
  end

  private

  def capture_structured_log
    io = StringIO.new
    logger = ActiveSupport::Logger.new(io)
    previous_logger = Rails.logger

    begin
      Rails.logger = logger
      yield
    ensure
      Rails.logger = previous_logger
    end

    JSON.parse(io.string.lines.last)
  end
end
