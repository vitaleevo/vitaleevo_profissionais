require "test_helper"

class SecurityHardeningTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  test "rails html responses include an enforcing content security policy" do
    get new_user_session_path

    assert_response :success
    csp = response.headers["Content-Security-Policy"]
    assert_includes csp, "default-src 'self'"
    assert_includes csp, "object-src 'none'"
    assert_includes csp, "frame-ancestors 'self'"
  end

  test "api not found responses do not expose internal record lookup details" do
    sign_in users(:admin)

    get "/api/v1/service_requests/999999", headers: { "ACCEPT" => "application/json" }

    assert_response :not_found
    assert_equal "not_found", JSON.parse(response.body).dig("error", "code")
    assert_equal "Recurso nao encontrado.", JSON.parse(response.body).dig("error", "message")
  end

  test "client cannot set internal operator notes when creating service request" do
    sign_in users(:client)

    post "/api/v1/service_requests",
      params: service_request_payload(operator_notes: "Priorizar cliente VIP interno."),
      as: :json

    assert_response :created
    assert_nil ServiceRequest.last.operator_notes
  end

  test "client cannot set internal budget cents when creating service request" do
    sign_in users(:client)

    assert_no_difference "ServiceRequest.count" do
      post "/api/v1/service_requests",
        params: service_request_payload(
          operator_notes: nil,
          request_attributes: { budget_cents: 1, budget_aoa: 12_000 }
        ),
        as: :json
    end

    assert_response :unprocessable_entity
    assert_equal "internal_budget_not_allowed", JSON.parse(response.body).dig("error", "code")
  end

  test "operational user can set internal operator notes when creating service request" do
    sign_in users(:admin)

    post "/api/v1/service_requests",
      params: service_request_payload(operator_notes: "Validado pela operacao."),
      as: :json

    assert_response :created
    assert_equal "Validado pela operacao.", ServiceRequest.last.operator_notes
  end

  test "operational user can set internal budget cents when creating service request" do
    sign_in users(:admin)

    post "/api/v1/service_requests",
      params: service_request_payload(
        operator_notes: "Validado pela operacao.",
        request_attributes: { budget_cents: 1_234_56, budget_aoa: nil }
      ),
      as: :json

    assert_response :created
    assert_equal 1_234_56, ServiceRequest.last.budget_cents
  end

  test "professional cannot create client service request through api" do
    professional_user = create_professional_user!
    sign_in professional_user

    assert_no_difference "ServiceRequest.count" do
      post "/api/v1/service_requests",
        params: service_request_payload(operator_notes: nil),
        as: :json
    end

    assert_response :forbidden
  end

  test "professional cannot access operational dashboard api" do
    professional_user = create_professional_user!
    sign_in professional_user

    get "/api/v1/dashboard", as: :json

    assert_response :forbidden
    assert_equal "forbidden", JSON.parse(response.body).dig("error", "code")
  end

  test "client payment payloads redact commission and professional payout" do
    payment = create_paid_service_request_payment!
    sign_in users(:client)

    get "/api/v1/payments", as: :json

    assert_response :success
    payload = JSON.parse(response.body).fetch("data").find { |item| item["id"] == payment.id }
    assert payload.present?
    assert_equal payment.amount_cents, payload.fetch("amount_cents")
    assert_not payload.key?("commission_cents")
    assert_not payload.key?("professional_payout_cents")
  end

  test "operational payment payloads include financial breakdown" do
    payment = create_paid_service_request_payment!
    sign_in users(:admin)

    get "/api/v1/payments", as: :json

    assert_response :success
    payload = JSON.parse(response.body).fetch("data").find { |item| item["id"] == payment.id }
    assert payload.present?
    assert_equal payment.commission_cents, payload.fetch("commission_cents")
    assert_equal payment.professional_payout_cents, payload.fetch("professional_payout_cents")
  end

  test "client cannot access another client's service request detail" do
    service_request = create_service_request!(client: other_client, title: "Pedido de outro cliente")
    sign_in users(:client)

    get "/api/v1/service_requests/#{service_request.id}", as: :json

    assert_response :not_found
    assert_equal "Recurso nao encontrado.", JSON.parse(response.body).dig("error", "message")
  end

  test "client payment index excludes another client's payments" do
    payment = create_paid_service_request_payment!(client: other_client)
    sign_in users(:client)

    get "/api/v1/payments", as: :json

    assert_response :success
    payment_ids = JSON.parse(response.body).fetch("data").map { |item| item.fetch("id") }
    assert_not_includes payment_ids, payment.id
  end

  test "professional payment index excludes another professional payments" do
    own_user = create_professional_user!(
      email: "profissional-pagamentos-proprio@example.com",
      name: "Profissional Pagamentos Proprio"
    )
    other_user = create_professional_user!(
      email: "profissional-pagamentos-outro@example.com",
      name: "Profissional Pagamentos Outro"
    )
    own_payment = create_paid_service_request_payment!(professional: own_user.professional)
    other_payment = create_paid_service_request_payment!(professional: other_user.professional)
    sign_in own_user

    get "/api/v1/payments", as: :json

    assert_response :success
    payment_ids = JSON.parse(response.body).fetch("data").map { |item| item.fetch("id") }
    assert_includes payment_ids, own_payment.id
    assert_not_includes payment_ids, other_payment.id
  end

  test "professional cannot access service request before assignment" do
    service_request = create_service_request!(client: other_client, title: "Pedido ainda nao atribuido")
    professional_user = create_professional_user!
    sign_in professional_user

    get "/api/v1/service_requests/#{service_request.id}", as: :json

    assert_response :not_found
  end

  test "operational user can access service request outside ownership scopes" do
    service_request = create_service_request!(client: other_client, title: "Pedido operacional")
    sign_in users(:admin)

    get "/api/v1/service_requests/#{service_request.id}", as: :json

    assert_response :success
    assert_equal service_request.id, JSON.parse(response.body).dig("data", "id")
  end

  private

  def service_request_payload(operator_notes:, request_attributes: {})
    {
      client: {
        name: "Cliente Seguranca",
        phone: "+244 930 700 001",
        address: "Talatona"
      },
      service_request: {
        service_category_id: security_category.id,
        title: "Pedido com notas internas",
        description: "Validar isolamento de campo operacional.",
        location: "Talatona",
        urgency: "normal",
        budget_aoa: 12_000,
        operator_notes: operator_notes
      }.merge(request_attributes)
    }
  end

  def create_paid_service_request_payment!(client: client_profile, professional: nil)
    request = create_service_request!(
      client: client,
      professional: professional,
      title: "Pagamento privado",
      status: "completed",
      budget_cents: 20_000_00
    )

    Payment.create!(service_request: request, amount_cents: 20_000_00, status: "paid", paid_at: Time.current)
  end

  def create_service_request!(client:, title:, status: "pending", budget_cents: 12_000_00, professional: nil)
    ServiceRequest.create!(
      client: client,
      professional: professional,
      service_category: security_category,
      title: title,
      description: "Validar privacidade financeira.",
      location: "Talatona",
      status: status,
      budget_cents: budget_cents
    )
  end

  def client_profile
    users(:client).client || Client.create!(
      user: users(:client),
      name: "Cliente Teste",
      phone: "+244 930 700 002"
    )
  end

  def other_client
    @other_client ||= Client.create!(
      name: "Outro Cliente",
      phone: "+244 930 700 003",
      email: "outro-cliente@example.com"
    )
  end

  def create_professional_user!(email: "profissional-isolamento@example.com", name: "Profissional Isolamento")
    user = User.create!(
      name: name,
      email: email,
      password: "password123",
      role: "professional"
    )
    Professional.create!(
      user: user,
      name: "Tecnico #{name}",
      phone: "+244 930 700 004",
      specialty: "Tecnico de seguranca",
      location: "Talatona",
      status: "online",
      documents_status: "verified"
    )
    user
  end

  def security_category
    @security_category ||= ServiceCategory.create!(
      name: "Seguranca API",
      slug: "seguranca-api",
      base_price_cents: 15_000_00,
      average_duration_minutes: 60
    )
  end
end
