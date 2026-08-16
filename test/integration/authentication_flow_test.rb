require "test_helper"

class AuthenticationFlowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  test "home is public" do
    get root_path

    assert_redirected_to "http://localhost:3001/"
  end

  test "legacy dashboard route redirects to the Next frontend" do
    get dashboard_path

    assert_redirected_to "http://localhost:3001/operacoes"
  end

  test "client cannot assign service requests" do
    sign_in users(:client)
    category = ServiceCategory.create!(
      name: "TI cliente teste",
      slug: "ti-cliente-auth-test",
      base_price_cents: 40_000_00,
      average_duration_minutes: 90
    )
    client = Client.create!(user: users(:client), name: "Cliente Auth", phone: "+244 930 100 001")
    request = ServiceRequest.create!(
      client: client,
      service_category: category,
      title: "Router sem sinal",
      description: "Precisa de suporte.",
      location: "Talatona",
      budget_cents: 35_000_00
    )

    post assign_service_request_path(request, professional_id: 1)

    assert_redirected_to root_path
  end
end
