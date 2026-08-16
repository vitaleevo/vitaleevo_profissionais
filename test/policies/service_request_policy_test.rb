require "test_helper"

class ServiceRequestPolicyTest < ActiveSupport::TestCase
  setup do
    @category = ServiceCategory.create!(
      name: "Canalizacao teste",
      slug: "canalizacao-policy-test",
      base_price_cents: 30_000_00,
      average_duration_minutes: 120
    )
    @client = Client.create!(user: users(:client), name: "Cliente Dono", phone: "+244 930 000 001")
    @other_client = Client.create!(name: "Outro Cliente", phone: "+244 930 000 002")
    @own_request = ServiceRequest.create!(
      client: @client,
      service_category: @category,
      title: "Fuga de agua",
      description: "Fuga no lavatorio.",
      location: "Talatona",
      budget_cents: 20_000_00
    )
    @other_request = ServiceRequest.create!(
      client: @other_client,
      service_category: @category,
      title: "Bomba parada",
      description: "Bomba de agua nao liga.",
      location: "Viana",
      budget_cents: 25_000_00
    )
  end

  test "client only sees own requests" do
    scope = ServiceRequestPolicy::Scope.new(users(:client), ServiceRequest.all).resolve

    assert_includes scope, @own_request
    refute_includes scope, @other_request
  end

  test "only operational users can assign" do
    assert ServiceRequestPolicy.new(users(:admin), @own_request).assign?
    refute ServiceRequestPolicy.new(users(:client), @own_request).assign?
  end

  test "only operational users can complete requests" do
    professional_user = User.create!(
      name: "Profissional Policy",
      email: "profissional-policy@example.com",
      password: "password123",
      role: "professional"
    )
    professional = Professional.create!(
      user: professional_user,
      name: "Tecnico Policy",
      phone: "+244 930 000 003",
      specialty: "Tecnico de redes",
      location: "Talatona",
      status: "online",
      documents_status: "verified"
    )
    @own_request.update!(professional: professional, status: "assigned")

    assert ServiceRequestPolicy.new(users(:admin), @own_request).complete?
    refute ServiceRequestPolicy.new(professional_user, @own_request).complete?
    assert ServiceRequestPolicy.new(professional_user, @own_request).update_status?
  end

  test "rejected assigned professional is excluded from request scope and status updates" do
    professional_user = User.create!(
      name: "Profissional Policy Rejeitado",
      email: "profissional-policy-rejeitado@example.com",
      password: "password123",
      role: "professional"
    )
    professional = Professional.create!(
      user: professional_user,
      name: "Tecnico Policy Rejeitado",
      phone: "+244 930 000 004",
      specialty: "Tecnico de redes",
      location: "Talatona",
      status: "online",
      documents_status: "rejected"
    )
    @own_request.update!(professional: professional, status: "assigned")

    scope = ServiceRequestPolicy::Scope.new(professional_user, ServiceRequest.all).resolve

    refute_includes scope, @own_request
    refute ServiceRequestPolicy.new(professional_user, @own_request).show?
    refute ServiceRequestPolicy.new(professional_user, @own_request).update_status?
  end
end
