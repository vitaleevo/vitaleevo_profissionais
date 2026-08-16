require "test_helper"

class ServiceRequestStatusSecurityTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @category = ServiceCategory.create!(
      name: "TI status API",
      slug: "ti-status-api",
      base_price_cents: 40_000_00,
      average_duration_minutes: 90
    )
    @professional_user = User.create!(
      name: "Profissional Status API",
      email: "profissional-status-api@example.com",
      password: "password123",
      role: "professional"
    )
    @professional = Professional.create!(
      user: @professional_user,
      name: "Tecnico Status API",
      phone: "+244 930 510 001",
      specialty: "Tecnico de redes",
      location: "Talatona",
      status: "online",
      documents_status: "verified"
    )
    client = Client.create!(name: "Cliente Status API", phone: "+244 930 510 002")
    @service_request = ServiceRequest.create!(
      client: client,
      professional: @professional,
      service_category: @category,
      title: "Rede instavel",
      description: "Precisa de suporte tecnico.",
      location: "Talatona",
      status: "assigned",
      budget_cents: 35_000_00
    )
  end

  test "assigned professional cannot complete request through api" do
    sign_in @professional_user

    assert_no_difference "Payment.count" do
      patch "/api/v1/service_requests/#{@service_request.id}/status",
        params: { status: "completed" },
        as: :json
    end

    assert_response :forbidden
    @service_request.reload
    assert_equal "assigned", @service_request.status
    assert_nil @service_request.completed_at
  end

  test "operational user can complete request through api and create payment" do
    sign_in users(:admin)

    assert_difference "Payment.count", 1 do
      patch "/api/v1/service_requests/#{@service_request.id}/status",
        params: { status: "completed" },
        as: :json
    end

    assert_response :success
    payload = JSON.parse(response.body)
    payment = @service_request.reload.payments.last
    assert_equal "completed", @service_request.status
    assert_equal "paid", payment.status
    assert_equal @service_request.budget_cents, payment.amount_cents
    assert_equal 1, payload.dig("data", "payments").length
    assert_equal "paid", payload.dig("data", "payments", 0, "status")
  end

  test "rejected assigned professional cannot access or update assigned request" do
    @professional.update!(documents_status: "rejected")
    sign_in @professional_user

    get "/api/v1/service_requests/#{@service_request.id}", as: :json

    assert_response :not_found

    patch "/api/v1/service_requests/#{@service_request.id}/status",
      params: { status: "accepted" },
      as: :json

    assert_response :not_found
    @service_request.reload
    assert_equal "assigned", @service_request.status
    assert_nil @service_request.accepted_at
  end

  test "rejected professional cannot access operational portal request surfaces" do
    @professional.update!(documents_status: "rejected")
    sign_in @professional_user

    get "/api/v1/professional_portal/dashboard", as: :json

    assert_response :forbidden
    assert_equal "professional_not_verified", JSON.parse(response.body).dig("error", "code")

    get "/api/v1/professional_portal/history", as: :json

    assert_response :forbidden
    assert_equal "professional_not_verified", JSON.parse(response.body).dig("error", "code")
  end

  test "operational user cannot assign request to unverified professional" do
    unverified_user = User.create!(
      name: "Profissional Assign Pendente",
      email: "profissional-assign-pendente@example.com",
      password: "password123",
      role: "professional"
    )
    unverified = Professional.create!(
      user: unverified_user,
      name: "Tecnico Assign Pendente API",
      phone: "+244 930 510 003",
      specialty: "Tecnico de redes",
      location: "Talatona",
      status: "online",
      documents_status: "pending"
    )
    ProfessionalService.create!(professional: unverified, service_category: @category)
    pending_request = ServiceRequest.create!(
      client: Client.create!(name: "Cliente Assign API", phone: "+244 930 510 004"),
      service_category: @category,
      title: "Router sem sinal",
      description: "Pedido sensivel para atribuicao.",
      location: "Talatona",
      status: "pending",
      budget_cents: 35_000_00
    )

    sign_in users(:admin)

    assert_no_difference "Notification.count" do
      post "/api/v1/service_requests/#{pending_request.id}/assign",
        params: { professional_id: unverified.id },
        as: :json
    end

    assert_response :unprocessable_entity
    pending_request.reload
    assert_nil pending_request.professional_id
    assert_equal "pending", pending_request.status

    sign_out users(:admin)
    sign_in unverified_user
    get "/api/v1/service_requests/#{pending_request.id}", as: :json

    assert_response :not_found
  end
end
