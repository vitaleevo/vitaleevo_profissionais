require "test_helper"

class ServiceRequestReviewTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @category = ServiceCategory.create!(
      name: "Review API",
      slug: "review-api",
      base_price_cents: 30_000_00,
      average_duration_minutes: 60
    )
    @client_user = User.create!(
      name: "Cliente Review",
      email: "cliente-review@example.com",
      password: "password123",
      role: "client"
    )
    @client = Client.create!(
      user: @client_user,
      name: "Cliente Review",
      phone: "+244 930 640 000",
      address: "Talatona"
    )
    @professional_user = User.create!(
      name: "Profissional Review",
      email: "profissional-review@example.com",
      password: "password123",
      role: "professional"
    )
    @professional = Professional.create!(
      user: @professional_user,
      name: "Profissional Review",
      phone: "+244 930 640 001",
      specialty: "Tecnico review",
      location: "Talatona",
      status: "online",
      documents_status: "verified",
      rating: 0,
      quality_rating: 0,
      punctuality_rating: 0,
      communication_rating: 0
    )
    @service_request = ServiceRequest.create!(
      client: @client,
      professional: @professional,
      service_category: @category,
      title: "Pedido concluido para avaliar",
      description: "Servico terminado.",
      location: "Talatona",
      status: "completed",
      budget_cents: 35_000_00,
      completed_at: 1.hour.ago
    )
  end

  test "client owner can review completed service request once" do
    sign_in @client_user

    assert_difference "Review.count", 1 do
      post "/api/v1/service_requests/#{@service_request.id}/review",
        params: review_payload(quality: 5, punctuality: 4, communication: 3),
        as: :json
    end

    assert_response :created
    payload = JSON.parse(response.body).fetch("data")
    assert_equal 5, payload.fetch("quality")
    assert_equal "Servico bem executado.", payload.fetch("comment")

    @professional.reload
    assert_equal 4.0, @professional.rating.to_f
    assert_equal 5.0, @professional.quality_rating.to_f
    assert_equal 4.0, @professional.punctuality_rating.to_f
    assert_equal 3.0, @professional.communication_rating.to_f

    get "/api/v1/service_requests/#{@service_request.id}", as: :json
    assert_response :success
    assert_equal 5, JSON.parse(response.body).dig("data", "review", "quality")
  end

  test "client cannot review request before completion" do
    @service_request.update!(status: "in_progress", completed_at: nil)
    sign_in @client_user

    assert_no_difference "Review.count" do
      post "/api/v1/service_requests/#{@service_request.id}/review",
        params: review_payload,
        as: :json
    end

    assert_response :forbidden
  end

  test "assigned professional cannot review own completed request" do
    sign_in @professional_user

    assert_no_difference "Review.count" do
      post "/api/v1/service_requests/#{@service_request.id}/review",
        params: review_payload,
        as: :json
    end

    assert_response :forbidden
  end

  test "client cannot review completed request twice" do
    Review.create!(
      service_request: @service_request,
      client: @client,
      professional: @professional,
      quality: 5,
      punctuality: 5,
      communication: 5
    )
    sign_in @client_user

    assert_no_difference "Review.count" do
      post "/api/v1/service_requests/#{@service_request.id}/review",
        params: review_payload,
        as: :json
    end

    assert_response :forbidden
  end

  test "public trust reviews redact client identity and service request code" do
    Review.create!(
      service_request: @service_request,
      client: @client,
      professional: @professional,
      quality: 5,
      punctuality: 4,
      communication: 5,
      comment: "Servico bem executado."
    )

    get "/api/v1/marketplace/trust", as: :json

    assert_response :success
    review = JSON.parse(response.body).dig("data", "reviews").first
    assert_equal "Cliente verificado", review.dig("client", "name")
    assert_not_equal @client.name, review.dig("client", "name")
    assert_not review.dig("client").key?("company_name")
    assert_not review.dig("client").key?("contact")
    assert_not review.dig("service_request").key?("code")
    assert_equal @service_request.title, review.dig("service_request", "title")
  end

  test "public trust excludes reviews for non public professionals" do
    visible_review = Review.create!(
      service_request: @service_request,
      client: @client,
      professional: @professional,
      quality: 5,
      punctuality: 5,
      communication: 5,
      comment: "Profissional verificado."
    )
    hidden_professional = Professional.create!(
      name: "Profissional Suspenso Review",
      phone: "+244 930 640 099",
      specialty: "Tecnico suspenso",
      location: "Talatona",
      status: "suspended",
      documents_status: "verified",
      rating: 5
    )
    hidden_request = ServiceRequest.create!(
      client: @client,
      professional: hidden_professional,
      service_category: @category,
      title: "Pedido de profissional suspenso",
      description: "Review nao deve aparecer em confianca publica.",
      location: "Talatona",
      status: "completed",
      budget_cents: 35_000_00,
      completed_at: 30.minutes.ago
    )
    hidden_review = Review.create!(
      service_request: hidden_request,
      client: @client,
      professional: hidden_professional,
      quality: 5,
      punctuality: 5,
      communication: 5,
      comment: "Nao publicar enquanto suspenso."
    )

    get "/api/v1/marketplace/trust", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    ids = payload.dig("data", "reviews").map { |review| review.fetch("id") }
    professional_ids = payload.dig("data", "professionals").map { |professional| professional.fetch("id") }

    assert_includes ids, visible_review.id
    refute_includes ids, hidden_review.id
    refute_includes professional_ids, hidden_professional.id
    assert_equal 1, payload.dig("data", "stats", "verified_professionals_count")
    assert_equal 1, payload.dig("data", "stats", "reviews_count")
  end

  private

  def review_payload(quality: 5, punctuality: 5, communication: 5)
    {
      review: {
        quality: quality,
        punctuality: punctuality,
        communication: communication,
        comment: "Servico bem executado."
      }
    }
  end
end
