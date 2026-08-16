require "json"

class StructuredEventLog
  SENSITIVE_KEYS = %w[
    authorization
    certificate
    cookie
    crypt
    cvc
    cvv
    email
    otp
    passw
    salt
    secret
    session
    token
    _key
  ].freeze

  FILTERED = "[FILTERED]".freeze

  def self.info(event, attributes = {})
    new(event, attributes).info
  end

  def initialize(event, attributes)
    @event = event
    @attributes = attributes
  end

  def info
    Rails.logger.info(JSON.generate(payload))
  end

  private

  attr_reader :event, :attributes

  def payload
    base_payload.merge(sanitized(attributes)).compact
  end

  def base_payload
    {
      event: event,
      emitted_at: Time.current.iso8601(3),
      request_id: Current.request_id,
      actor_id: Current.user&.id,
      actor_role: Current.user&.role
    }
  end

  def sanitized(value)
    case value
    when Hash
      value.each_with_object({}) do |(key, nested_value), result|
        result[key] = sensitive_key?(key) ? FILTERED : sanitized(nested_value)
      end
    when Array
      value.map { |nested_value| sanitized(nested_value) }
    else
      value
    end
  end

  def sensitive_key?(key)
    normalized = key.to_s.downcase
    SENSITIVE_KEYS.any? { |sensitive_key| normalized.include?(sensitive_key) }
  end
end
