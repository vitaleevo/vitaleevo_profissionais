require "test_helper"

class MatchingServiceTest < ActiveSupport::TestCase
  setup do
    @category = ServiceCategory.create!(
      name: "TI e redes",
      slug: "ti-redes-test",
      base_price_cents: 40_000_00,
      average_duration_minutes: 90
    )
    @client = Client.create!(name: "Cliente Teste", phone: "+244 900 000 000")
    @request = ServiceRequest.create!(
      client: @client,
      service_category: @category,
      title: "Rede instavel",
      description: "Precisa de suporte tecnico.",
      location: "Talatona",
      neighborhood: "Talatona",
      latitude: -8.9166,
      longitude: 13.1829,
      budget_cents: 35_000_00
    )

    @best = Professional.create!(
      name: "Melhor Candidato",
      phone: "+244 900 000 001",
      specialty: "Tecnico de redes",
      location: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "verified",
      experience_years: 8,
      hourly_rate_cents: 15_000_00,
      rating: 4.9,
      latitude: -8.9170,
      longitude: 13.1832
    )
    @best.service_categories << @category

    @distant = Professional.create!(
      name: "Candidato Distante",
      phone: "+244 900 000 002",
      specialty: "Tecnico de redes",
      location: "Viana",
      neighborhood: "Viana",
      status: "offline",
      documents_status: "verified",
      experience_years: 3,
      hourly_rate_cents: 12_000_00,
      rating: 4.2,
      latitude: -8.9040,
      longitude: 13.3718
    )
    @distant.service_categories << @category
  end

  test "prioritizes closer available verified professionals" do
    matches = MatchingService.new(@request).call(limit: 2)

    assert_equal @best, matches.first.professional
    assert_operator matches.first.score, :>, matches.second.score
  end
end
