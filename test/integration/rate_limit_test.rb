require "test_helper"
require "stringio"

class RateLimitTest < ActionDispatch::IntegrationTest
  setup do
    Rack::Attack.cache.store.clear
  end

  test "throttles repeated api login attempts from same ip" do
    payloads = capture_json_logs do
      11.times do
        post "/api/v1/session",
          params: { email: "nobody@example.com", password: "wrong-password" },
          as: :json,
          headers: { "REMOTE_ADDR" => "203.0.113.10" }
      end
    end

    assert_response :too_many_requests
    assert_equal "60", response.headers["Retry-After"]
    assert_equal "rate_limited", JSON.parse(response.body).dig("error", "code")
    event = payloads.find { |payload| payload["event"] == "security.rate_limited" }
    assert event.present?
    assert_equal "/api/v1/session", event.fetch("path")
    assert_equal 429, event.fetch("http_status")
  end

  test "throttles api login by canonical proxy client ip" do
    11.times do |index|
      post "/api/v1/session",
        params: { email: "nobody@example.com", password: "wrong-password" },
        as: :json,
        headers: {
          "REMOTE_ADDR" => "10.0.0.10",
          "X-Forwarded-For" => "198.51.100.#{index}, 203.0.113.20",
          "X-Real-IP" => "203.0.113.20"
        }
    end

    assert_response :too_many_requests
    assert_equal "rate_limited", JSON.parse(response.body).dig("error", "code")
  end

  test "throttles repeated public professional search requests" do
    61.times do
      get "/api/v1/professionals/search",
        as: :json,
        headers: { "REMOTE_ADDR" => "203.0.113.30" }
    end

    assert_response :too_many_requests
    assert_equal "rate_limited", JSON.parse(response.body).dig("error", "code")
  end

  private

  def capture_json_logs
    io = StringIO.new
    logger = ActiveSupport::Logger.new(io)
    previous_logger = Rails.logger

    begin
      Rails.logger = logger
      yield
    ensure
      Rails.logger = previous_logger
    end

    io.string.lines.filter_map do |line|
      JSON.parse(line)
    rescue JSON::ParserError
      nil
    end
  end
end
