require "test_helper"

class MarketplaceScreensTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @category = ServiceCategory.create!(
      name: "TI e redes",
      slug: "ti-redes-test",
      description: "Configuracao de redes, suporte a computadores e cameras IP.",
      base_price_cents: 40_000_00,
      average_duration_minutes: 120
    )
    @client = Client.create!(user: users(:client), name: "Cliente Telas", phone: "+244 930 100 002")
    @professional_user = User.create!(
      name: "Profissional Telas",
      email: "profissional-telas@example.com",
      password: "password123",
      role: "professional"
    )
    @professional = Professional.create!(
      user: @professional_user,
      name: "Marta Simoes",
      phone: "+244 930 100 003",
      specialty: "Redes e suporte",
      location: "Luanda",
      status: "online",
      documents_status: "verified",
      hourly_rate_cents: 35_000_00,
      experience_years: 4,
      rating: 4.8,
      completed_jobs: 18
    )
    ProfessionalService.create!(professional: @professional, service_category: @category)
  end

  test "legacy marketplace routes redirect to the Next frontend" do
    get root_path
    assert_redirected_to "http://localhost:3001/"

    get categories_path
    assert_redirected_to "http://localhost:3001/servicos"

    get service_detail_path(@category.slug)
    assert_redirected_to "http://localhost:3001/servicos/#{@category.slug}"

    get how_it_works_path
    assert_redirected_to "http://localhost:3001/como-funciona"

    get help_center_path
    assert_redirected_to "http://localhost:3001/ajuda"

    get trust_center_path
    assert_redirected_to "http://localhost:3001/confianca"
  end

  test "legacy professional routes redirect to the Next frontend" do
    ServiceRequest.create!(
      client: @client,
      service_category: @category,
      professional: @professional,
      title: "Rede sem sinal",
      description: "Precisa de diagnostico e configuracao.",
      location: "Talatona",
      budget_cents: 45_000_00,
      status: "assigned"
    )

    get professional_dashboard_path
    assert_redirected_to "http://localhost:3001/profissional"

    get professional_wallet_path
    assert_redirected_to "http://localhost:3001/profissional/carteira"

    get professional_jobs_path
    assert_redirected_to "http://localhost:3001/profissional/vagas"

    get professional_registration_path
    assert_redirected_to "http://localhost:3001/profissional/cadastro"
  end
end
