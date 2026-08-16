# frozen_string_literal: true

module ConexaoDomains
  DEFAULT_ROOT_DOMAIN = "profiangola.ao"
  INTERNAL_HOSTS = %w[localhost 127.0.0.1 rails web .railway.app .vercel.app].freeze
  SAME_SITE_VALUES = %i[lax strict none].freeze

  module_function

  def root_domain
    value = ENV.fetch("PROFISSIONAIS_ROOT_DOMAIN") do
      ENV.fetch("CONEXAO_ROOT_DOMAIN", DEFAULT_ROOT_DOMAIN)
    end.to_s.strip

    value.empty? ? DEFAULT_ROOT_DOMAIN : value
  end

  def public_hosts
    root = root_domain

    [
      root,
      "www.#{root}",
      "admin.#{root}",
      "operacoes.#{root}",
      "app.#{root}"
    ]
  end

  def hosts
    list_env("RAILS_HOSTS", public_hosts + INTERNAL_HOSTS)
  end

  def session_cookie_domain
    configured = ENV.fetch("SESSION_COOKIE_DOMAIN", "").to_s.strip
    return configured unless configured.empty?

    rails_env.production? ? ".#{root_domain}" : nil
  end

  def session_same_site
    value = ENV.fetch("SESSION_COOKIE_SAME_SITE", "lax").to_s.downcase.to_sym
    SAME_SITE_VALUES.include?(value) ? value : :lax
  end

  def boolean_env(name, default)
    value = ENV.fetch(name, "").to_s.strip.downcase
    return default if value.empty?
    return true if %w[1 true yes on].include?(value)
    return false if %w[0 false no off].include?(value)

    default
  end

  def list_env(name, fallback)
    values = ENV.fetch(name, "").split(",").map(&:strip).reject(&:empty?)
    values.empty? ? fallback : values
  end

  def rails_env
    defined?(Rails) ? Rails.env : ActiveSupport::StringInquirer.new(ENV.fetch("RAILS_ENV", "development"))
  end
end
