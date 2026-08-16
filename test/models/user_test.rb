require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "uses timeoutable sessions" do
    assert_includes User.devise_modules, :timeoutable
    assert Devise.timeout_in <= 12.hours
  end

  test "uses paranoid auth and hardened rememberable cookie options" do
    assert Devise.paranoid
    assert_equal true, Devise.rememberable_options[:httponly]
    assert_equal Rails.application.config.session_options[:same_site], Devise.rememberable_options[:same_site]
    assert_equal Rails.application.config.session_options[:secure], Devise.rememberable_options[:secure]
  end
end
