# frozen_string_literal: true

require "test_helper"
require Rails.root.join("config/conexao_domains").to_s

class ConexaoDomainsTest < ActiveSupport::TestCase
  MANAGED_ENV = %w[
    PROFISSIONAIS_ROOT_DOMAIN
    CONEXAO_ROOT_DOMAIN
    RAILS_HOSTS
    SESSION_COOKIE_DOMAIN
    SESSION_COOKIE_SAME_SITE
    RAILS_FORCE_SSL
  ].freeze

  setup do
    @env_snapshot = MANAGED_ENV.to_h { |key| [ key, ENV.fetch(key, nil) ] }
    MANAGED_ENV.each { |key| ENV.delete(key) }
  end

  teardown do
    MANAGED_ENV.each do |key|
      value = @env_snapshot[key]
      value.nil? ? ENV.delete(key) : ENV[key] = value
    end
  end

  test "public hosts follow the configured root domain" do
    ENV["PROFISSIONAIS_ROOT_DOMAIN"] = "example.test"

    assert_includes ConexaoDomains.public_hosts, "example.test"
    assert_includes ConexaoDomains.public_hosts, "www.example.test"
    assert_includes ConexaoDomains.public_hosts, "admin.example.test"
    assert_includes ConexaoDomains.public_hosts, "app.example.test"
    assert_not_includes ConexaoDomains.public_hosts, "pracaangola.example.test"
  end

  test "legacy root domain environment remains supported" do
    ENV["CONEXAO_ROOT_DOMAIN"] = "legacy.example.test"

    assert_includes ConexaoDomains.public_hosts, "legacy.example.test"
  end

  test "hosts include public and internal defaults" do
    assert_includes ConexaoDomains.hosts, "profiangola.ao"
    assert_includes ConexaoDomains.hosts, "rails"
    assert_includes ConexaoDomains.hosts, "web"
    assert_includes ConexaoDomains.hosts, "127.0.0.1"
  end

  test "hosts can be overridden by environment" do
    ENV["RAILS_HOSTS"] = "staging.profiangola.ao, rails"

    assert_equal %w[staging.profiangola.ao rails], ConexaoDomains.hosts
  end

  test "boolean env accepts common enabled and disabled values" do
    ENV["RAILS_FORCE_SSL"] = "false"
    assert_not ConexaoDomains.boolean_env("RAILS_FORCE_SSL", true)

    ENV["RAILS_FORCE_SSL"] = "yes"
    assert ConexaoDomains.boolean_env("RAILS_FORCE_SSL", false)
  end

  test "session same site falls back to lax when invalid" do
    ENV["SESSION_COOKIE_SAME_SITE"] = "invalid"

    assert_equal :lax, ConexaoDomains.session_same_site
  end
end
