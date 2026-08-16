require "test_helper"

class SecurityReleaseFlowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @category = ServiceCategory.create!(
      name: "Release Security Flow",
      slug: "release-security-flow",
      base_price_cents: 45_000_00,
      average_duration_minutes: 90
    )
    @client_user = User.create!(
      name: "Cliente Release",
      email: "cliente-release@example.com",
      password: "password123",
      role: "client"
    )
    @client = Client.create!(
      user: @client_user,
      name: "Cliente Release",
      phone: "+244 930 880 001",
      email: "cliente-release@example.com",
      address: "Rua do cliente release",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona"
    )
    @professional_user = User.create!(
      name: "Profissional Release",
      email: "profissional-release@example.com",
      password: "password123",
      role: "professional"
    )
    @professional = Professional.create!(
      user: @professional_user,
      name: "Tecnico Release",
      phone: "+244 930 880 002",
      email: "profissional-release@example.com",
      specialty: "Tecnico de redes",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "verified",
      experience_years: 4,
      rating: 4.6
    )
    ProfessionalService.create!(professional: @professional, service_category: @category)
    @operator = User.create!(
      name: "Operador Release",
      email: "operador-release@example.com",
      password: "password123",
      role: "operator"
    )
  end

  test "client professional and operation complete lifecycle without cross role leaks" do
    service_request = client_creates_request!
    client_sees_matches_without_private_professional_data!(service_request)
    professional_cannot_see_unassigned_request!(service_request)
    operation_assigns_request!(service_request)
    professional_accepts_request_but_cannot_complete_it!(service_request)
    operation_completes_request_with_financial_breakdown!(service_request)
    client_reviews_completed_request_without_financial_breakdown!(service_request)
    professional_sees_own_completed_request_with_financial_breakdown!(service_request)
  end

  private

  def client_creates_request!
    sign_in @client_user

    assert_difference "ServiceRequest.count", 1 do
      post "/api/v1/service_requests",
        params: {
          client: {
            name: @client.name,
            phone: @client.phone,
            address: @client.address,
            province: @client.province,
            municipality: @client.municipality,
            neighborhood: @client.neighborhood
          },
          service_request: {
            service_category_id: @category.id,
            title: "Router release sem sinal",
            description: "Fluxo de seguranca de release.",
            location: "Talatona",
            province: "Luanda",
            municipality: "Talatona",
            neighborhood: "Talatona",
            urgency: "normal",
            budget_aoa: 45_000
          }
        },
        as: :json
    end

    assert_response :created
    service_request = ServiceRequest.find(JSON.parse(response.body).dig("data", "id"))
    assert_equal @client.id, service_request.client_id
    assert_equal "pending", service_request.status
    service_request
  end

  def client_sees_matches_without_private_professional_data!(service_request)
    get "/api/v1/service_requests/#{service_request.id}/matches", as: :json

    assert_response :success
    match = JSON.parse(response.body).fetch("data").find { |item|
      item.dig("professional", "id") == @professional.id
    }
    assert match.present?
    assert_not match.fetch("professional").key?("contact")
    assert_not match.fetch("professional").key?("coordinates")
  end

  def professional_cannot_see_unassigned_request!(service_request)
    sign_out @client_user
    sign_in @professional_user

    get "/api/v1/service_requests/#{service_request.id}", as: :json

    assert_response :not_found
  end

  def operation_assigns_request!(service_request)
    sign_out @professional_user
    sign_in @operator

    assert_difference "Notification.count", 1 do
      post "/api/v1/service_requests/#{service_request.id}/assign",
        params: { professional_id: @professional.id },
        as: :json
    end

    assert_response :success
    assert_equal "assigned", service_request.reload.status
    assert_equal @professional.id, service_request.professional_id
  end

  def professional_accepts_request_but_cannot_complete_it!(service_request)
    sign_out @operator
    sign_in @professional_user

    get "/api/v1/service_requests/#{service_request.id}", as: :json
    assert_response :success
    assert_equal @client.phone, JSON.parse(response.body).dig("data", "client", "contact", "phone")

    patch "/api/v1/service_requests/#{service_request.id}/status",
      params: { status: "accepted" },
      as: :json

    assert_response :success
    assert_equal "accepted", service_request.reload.status

    assert_no_difference "Payment.count" do
      patch "/api/v1/service_requests/#{service_request.id}/status",
        params: { status: "completed" },
        as: :json
    end

    assert_response :forbidden
  end

  def operation_completes_request_with_financial_breakdown!(service_request)
    sign_out @professional_user
    sign_in @operator

    assert_difference "Payment.count", 1 do
      patch "/api/v1/service_requests/#{service_request.id}/status",
        params: { status: "completed" },
        as: :json
    end

    assert_response :success
    service_request.reload
    assert_equal "completed", service_request.status
    assert service_request.completed_at.present?

    payment = JSON.parse(response.body).dig("data", "payments").first
    assert_equal service_request.budget_cents, payment.fetch("amount_cents")
    assert payment.key?("commission_cents")
    assert payment.key?("professional_payout_cents")
  end

  def client_reviews_completed_request_without_financial_breakdown!(service_request)
    sign_out @operator
    sign_in @client_user

    get "/api/v1/service_requests/#{service_request.id}", as: :json
    assert_response :success
    payment = JSON.parse(response.body).dig("data", "payments").first
    assert payment.present?
    assert_not payment.key?("commission_cents")
    assert_not payment.key?("professional_payout_cents")

    assert_difference "Review.count", 1 do
      post "/api/v1/service_requests/#{service_request.id}/review",
        params: {
          review: {
            quality: 5,
            punctuality: 4,
            communication: 5,
            comment: "Fluxo completo validado."
          }
        },
        as: :json
    end

    assert_response :created
  end

  def professional_sees_own_completed_request_with_financial_breakdown!(service_request)
    sign_out @client_user
    sign_in @professional_user

    get "/api/v1/service_requests/#{service_request.id}", as: :json

    assert_response :success
    payload = JSON.parse(response.body).fetch("data")
    payment = payload.fetch("payments").first
    assert payment.key?("commission_cents")
    assert payment.key?("professional_payout_cents")
    assert_equal 5, payload.dig("review", "quality")
  end
end
