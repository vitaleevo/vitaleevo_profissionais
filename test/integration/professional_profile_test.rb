require "test_helper"

class ProfessionalProfileTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @category = ServiceCategory.create!(
      name: "Perfil profissional teste",
      slug: "perfil-profissional-teste",
      base_price_cents: 35_000_00,
      average_duration_minutes: 90
    )
    @professional_user = User.create!(
      name: "Profissional Sem Perfil",
      email: "profissional-sem-perfil@example.com",
      password: "password123",
      role: "professional"
    )
  end

  test "professional user can create own profile with categories" do
    sign_in @professional_user

    assert_difference "Professional.count", 1 do
      post "/api/v1/professional_portal/profile",
        params: profile_payload(name: "Novo Profissional"),
        as: :json
    end

    assert_response :created
    profile = @professional_user.reload.professional
    assert_equal "Novo Profissional", profile.name
    assert_equal "pending", profile.documents_status
    assert_equal [ @category.id ], profile.service_category_ids
    response_data = JSON.parse(response.body).fetch("data")
    assert_equal "Tecnico de redes", response_data.fetch("specialty")
    assert_equal [ @category.id ], response_data.fetch("service_categories").map { |category| category.fetch("id") }
  end

  test "professional user can update own profile without changing document status" do
    profile = Professional.create!(
      user: @professional_user,
      name: "Perfil Antigo",
      phone: "+244 930 620 001",
      specialty: "Tecnico antigo",
      location: "Talatona",
      status: "offline",
      documents_status: "pending"
    )
    sign_in @professional_user

    patch "/api/v1/professional_portal/profile",
      params: profile_payload(name: "Perfil Atualizado").deep_merge(
        professional: {
          documents_status: "verified",
          service_category_ids: [ @category.id ]
        }
      ),
      as: :json

    assert_response :success
    profile.reload
    assert_equal "Perfil Atualizado", profile.name
    assert_equal "pending", profile.documents_status
    assert_equal [ @category.id ], profile.service_category_ids
  end

  test "professional user cannot set suspended status through self service" do
    sign_in @professional_user

    assert_no_difference "Professional.count" do
      patch "/api/v1/professional_portal/profile",
        params: profile_payload(status: "suspended"),
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "client cannot create professional profile" do
    sign_in users(:client)

    assert_no_difference "Professional.count" do
      patch "/api/v1/professional_portal/profile",
        params: profile_payload,
        as: :json
    end

    assert_response :forbidden
  end

  private

  def profile_payload(name: "Tecnico Perfil", status: "online")
    {
      professional: {
        name: name,
        phone: "+244 930 620 000",
        email: "tecnico.perfil@example.com",
        specialty: "Tecnico de redes",
        bio: "Suporte a redes e computadores.",
        location: "Talatona, Luanda",
        province: "Luanda",
        municipality: "Talatona",
        neighborhood: "Talatona",
        hourly_rate_cents: 20_000_00,
        experience_years: 5,
        response_minutes: 20,
        status: status,
        service_category_ids: [ @category.id ]
      }
    }
  end
end
