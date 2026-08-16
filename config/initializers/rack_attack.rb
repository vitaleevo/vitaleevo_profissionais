require "ipaddr"

class Rack::Attack
  cache_store = Rails.cache
  cache_store = ActiveSupport::Cache::MemoryStore.new if cache_store.is_a?(ActiveSupport::Cache::NullStore)
  self.cache.store = cache_store

  AUTH_LIMIT = ENV.fetch("RATE_LIMIT_AUTH_PER_MINUTE", "10").to_i
  PUBLIC_SEARCH_LIMIT = ENV.fetch("RATE_LIMIT_PUBLIC_SEARCH_PER_MINUTE", "60").to_i
  API_LIMIT = ENV.fetch("RATE_LIMIT_API_PER_MINUTE", "300").to_i
  TRUSTED_PROXY_RANGES = [
    IPAddr.new("10.0.0.0/8"),
    IPAddr.new("127.0.0.0/8"),
    IPAddr.new("172.16.0.0/12"),
    IPAddr.new("192.168.0.0/16"),
    IPAddr.new("::1/128"),
    IPAddr.new("fc00::/7")
  ].freeze

  throttle("auth/ip", limit: AUTH_LIMIT, period: 1.minute) do |request|
    client_ip(request) if request.post? && [ "/api/v1/session", "/users/sign_in" ].include?(request.path)
  end

  throttle("public-search/ip", limit: PUBLIC_SEARCH_LIMIT, period: 1.minute) do |request|
    client_ip(request) if request.get? && request.path == "/api/v1/professionals/search"
  end

  throttle("api/ip", limit: API_LIMIT, period: 1.minute) do |request|
    client_ip(request) if request.path.start_with?("/api/")
  end

  self.throttled_responder = lambda do |request|
    match_data = request.env["rack.attack.match_data"] || {}
    retry_after = match_data[:period].presence || 60
    StructuredEventLog.info(
      "security.rate_limited",
      throttle: request.env["rack.attack.matched"],
      method: request.request_method,
      path: request.path,
      http_status: 429,
      retry_after: retry_after.to_i,
      request_id: request.get_header("action_dispatch.request_id")
    )

    [
      429,
      {
        "Content-Type" => "application/json",
        "Retry-After" => retry_after.to_s
      },
      [
        {
          error: {
            code: "rate_limited",
            message: "Muitas tentativas. Tente novamente dentro de instantes."
          }
        }.to_json
      ]
    ]
  end

  class << self
    private

    def client_ip(request)
      real_ip = request.get_header("HTTP_X_REAL_IP").to_s.strip
      return real_ip if valid_ip?(real_ip) && trusted_proxy?(request.get_header("REMOTE_ADDR"))

      remote_ip = request.get_header("action_dispatch.remote_ip")
      remote_ip.to_s.presence || request.ip
    end

    def trusted_proxy?(remote_addr)
      ip = IPAddr.new(remote_addr.to_s)
      TRUSTED_PROXY_RANGES.any? { |range| range.include?(ip) }
    rescue IPAddr::InvalidAddressError
      false
    end

    def valid_ip?(value)
      IPAddr.new(value)
      true
    rescue IPAddr::InvalidAddressError
      false
    end
  end
end
