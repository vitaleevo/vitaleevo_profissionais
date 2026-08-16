# frozen_string_literal: true

require Rails.root.join("config/conexao_domains").to_s

session_secure = ConexaoDomains.boolean_env("SESSION_COOKIE_SECURE", Rails.env.production?)
session_secure = true if ConexaoDomains.session_same_site == :none

Rails.application.config.session_store(
  :cookie_store,
  key: ENV.fetch("SESSION_COOKIE_KEY", "_profiangola_session"),
  domain: ConexaoDomains.session_cookie_domain,
  same_site: ConexaoDomains.session_same_site,
  secure: session_secure,
  httponly: true
)
