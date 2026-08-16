require "test_helper"
require "stringio"
require "tempfile"

class ApiV1ContractTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @large_upload_tempfiles = []
    @category = ServiceCategory.create!(
      name: "TI API",
      slug: "ti-api-contract",
      description: "Suporte tecnico para testes de API.",
      base_price_cents: 40_000_00,
      average_duration_minutes: 90
    )
  end

  teardown do
    @large_upload_tempfiles.each do |file|
      file.close
      file.unlink
    end
  end

  test "health contract returns operational status" do
    get "/api/v1/health", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal "ok", payload.dig("data", "status")
    assert_equal "ok", payload.dig("data", "checks", "database")
    assert payload.dig("data", "checked_at").present?
  end

  test "public marketplace contract returns data envelope" do
    get "/api/v1/marketplace/home", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert payload.key?("data")
    assert_kind_of Array, payload.dig("data", "categories")
    assert_includes payload.dig("data", "categories").map { |category| category["slug"] }, @category.slug
    assert_match %r{\A/assets/}, payload.dig("data", "categories").first["image_path"]
  end

  test "authenticated me contract returns current user" do
    get "/api/v1/me", as: :json
    assert_response :unauthorized

    sign_in users(:client)
    get "/api/v1/me", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal "client", payload.dig("data", "role")
    assert_equal users(:client).email, payload.dig("data", "email")
  end

  test "deactivated user cannot keep using an existing api session" do
    user = User.create!(
      name: "Cliente Desativado",
      email: "cliente.desativado@example.com",
      password: "password123",
      role: "client",
      active: true
    )

    sign_in user
    user.update!(active: false)

    get "/api/v1/me", as: :json

    assert_response :unauthorized
    assert JSON.parse(response.body).fetch("error").present?
  end

  test "account contract returns account summary" do
    sign_in users(:client)

    get "/api/v1/account", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal users(:client).email, payload.dig("data", "user", "email")
    assert_kind_of Array, payload.dig("data", "recent_service_requests")
    assert_kind_of Array, payload.dig("data", "recent_payments")
  end

  test "session contract supports csrf and login" do
    get "/api/v1/session/csrf", as: :json
    assert_response :success
    assert JSON.parse(response.body).dig("data", "csrf_token").present?
    pre_login_cookie = session_cookie_from_response

    post "/api/v1/session",
      params: {
        email: users(:client).email,
        password: "password123"
      },
      as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal users(:client).email, payload.dig("data", "email")
    assert_session_cookie_hardened raw_session_cookie
    login_cookie = session_cookie_from_response
    assert login_cookie.present?
    refute_equal pre_login_cookie, login_cookie
  end

  test "session contract uses public safe errors for invalid login payloads" do
    post "/api/v1/session",
      params: {
        email: users(:client).email
      },
      as: :json

    assert_response :bad_request
    payload = JSON.parse(response.body)
    assert_equal "bad_request", payload.dig("error", "code")
    assert_equal "Pedido invalido.", payload.dig("error", "message")
    assert_no_match(/password|senha|param|missing/i, response.body)
  end

  test "session contract keeps credential failures generic" do
    logged_payloads = capture_json_logs do
      post "/api/v1/session",
        params: {
          email: "nao-existe@example.com",
          password: "password123"
        },
        as: :json
    end

    assert logged_payloads.any? { |payload| payload["event"] == "auth.login_failed" }
    assert logged_payloads.any? { |payload| payload["event"] == "api.error" && payload["error_code"] == "invalid_credentials" }

    assert_response :unauthorized
    payload = JSON.parse(response.body)
    assert_equal "invalid_credentials", payload.dig("error", "code")
    assert_equal "Email ou senha invalidos.", payload.dig("error", "message")
    assert_no_match(/nao-existe|not found|inativo|desativado/i, response.body)
  end

  test "session contract emits structured login success and logout events" do
    login_payloads = capture_json_logs do
      post "/api/v1/session",
        params: {
          email: users(:client).email,
          password: "password123"
        },
        as: :json
    end

    assert_response :success
    login_event = login_payloads.find { |payload| payload["event"] == "auth.login_succeeded" }
    assert login_event.present?
    assert_equal users(:client).id, login_event.fetch("actor_id")
    assert_equal "client", login_event.fetch("actor_role")
    assert_not login_event.key?("email")

    logout_payloads = capture_json_logs do
      delete "/api/v1/session", as: :json
    end

    assert_response :success
    logout_event = logout_payloads.find { |payload| payload["event"] == "auth.logout_succeeded" }
    assert logout_event.present?
    assert_equal users(:client).id, logout_event.fetch("actor_id")
    assert_equal "client", logout_event.fetch("actor_role")
  end

  test "session contract revokes authenticated session on logout" do
    post "/api/v1/session",
      params: {
        email: users(:client).email,
        password: "password123"
      },
      as: :json

    assert_response :success

    get "/api/v1/me", as: :json
    assert_response :success

    delete "/api/v1/session", as: :json
    assert_response :success
    assert session_cookie_expired?, response.headers["Set-Cookie"].to_s

    get "/api/v1/me", as: :json
    assert_response :unauthorized
  end

  test "client can create service request through api" do
    sign_in users(:client)

    assert_difference "ServiceRequest.count", 1 do
      post "/api/v1/service_requests",
        params: {
          client: {
            name: "Cliente API",
            phone: "+244 930 222 100",
            address: "Talatona",
            neighborhood: "Talatona"
          },
          service_request: {
            service_category_id: @category.id,
            title: "Router sem sinal",
            description: "Internet instavel no escritorio.",
            location: "Talatona",
            urgency: "normal",
            budget_aoa: 35_000
          }
        },
        as: :json
    end

    assert_response :created
    payload = JSON.parse(response.body)
    assert_equal "pending", payload.dig("data", "status")
    assert_equal @category.slug, payload.dig("data", "service_category", "slug")
  end

  test "client can create service request with private attachment metadata" do
    sign_in users(:client)

    assert_difference [ "ServiceRequest.count", "ServiceRequestAttachment.count" ], 1 do
      post "/api/v1/service_requests",
        params: {
          client: {
            name: "Cliente Anexo",
            phone: "+244 930 222 101",
            address: "Talatona"
          },
          service_request: {
            service_category_id: @category.id,
            title: "Quadro com curto",
            description: "Foto em anexo para triagem.",
            location: "Talatona",
            urgency: "urgent",
            budget_aoa: 45_000
          },
          attachments: [ upload_file ]
        },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :created
    attachment = JSON.parse(response.body).dig("data", "attachments").first
    assert_equal "document.pdf", attachment.fetch("original_filename")
    assert_equal "application/pdf", attachment.fetch("content_type")
    assert_not attachment.key?("url")
  end

  test "client cannot create service request with invalid attachment type" do
    sign_in users(:client)

    assert_no_difference [ "ServiceRequest.count", "ServiceRequestAttachment.count" ] do
      post "/api/v1/service_requests",
        params: {
          client: {
            name: "Cliente Anexo Invalido",
            phone: "+244 930 222 102",
            address: "Talatona"
          },
          service_request: {
            service_category_id: @category.id,
            title: "Anexo invalido",
            description: "Arquivo nao permitido.",
            location: "Talatona",
            urgency: "normal",
            budget_aoa: 10_000
          },
          attachments: [ upload_file("document.txt", "text/plain") ]
        },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :unprocessable_entity
  end

  test "client cannot create service request when attachments exceed aggregate upload limit" do
    sign_in users(:client)

    assert_no_difference [ "ServiceRequest.count", "ServiceRequestAttachment.count" ] do
      post "/api/v1/service_requests",
        params: {
          client: {
            name: "Cliente Anexos Grandes",
            phone: "+244 930 222 104",
            address: "Talatona"
          },
          service_request: {
            service_category_id: @category.id,
            title: "Anexos acima do limite total",
            description: "Arquivos individualmente validos, mas acima do limite agregado.",
            location: "Talatona",
            urgency: "normal",
            budget_aoa: 10_000
          },
          attachments: [
            large_pdf_upload("large-a.pdf", megabytes: 7),
            large_pdf_upload("large-b.pdf", megabytes: 7),
            large_pdf_upload("large-c.pdf", megabytes: 7)
          ]
        },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :unprocessable_entity
    assert_equal "attachments_too_large", JSON.parse(response.body).dig("error", "code")
  end

  test "client cannot create service request with spoofed attachment content type" do
    sign_in users(:client)

    assert_no_difference [ "ServiceRequest.count", "ServiceRequestAttachment.count" ] do
      post "/api/v1/service_requests",
        params: {
          client: {
            name: "Cliente Anexo Falso",
            phone: "+244 930 222 103",
            address: "Talatona"
          },
          service_request: {
            service_category_id: @category.id,
            title: "Anexo falso",
            description: "Arquivo com MIME declarado incorreto.",
            location: "Talatona",
            urgency: "normal",
            budget_aoa: 10_000
          },
          attachments: [ upload_file("document.txt", "application/pdf") ]
        },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :unprocessable_entity
  end

  test "service request index supports status and category filters" do
    other_category = ServiceCategory.create!(
      name: "Canalizacao API",
      slug: "canalizacao-api-contract",
      description: "Canalizacao para testes de filtro.",
      base_price_cents: 25_000_00,
      average_duration_minutes: 60
    )
    client = Client.create!(
      user: users(:client),
      name: "Cliente Filtro API",
      phone: "+244 930 222 120",
      address: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona"
    )
    matching_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Router sem sinal",
      description: "Pedido pendente da categoria filtrada.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "urgent",
      budget_cents: 35_000_00
    )
    ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido ja concluido",
      description: "Mesmo servico com estado diferente.",
      location: "Talatona",
      province: "Luanda",
      status: "completed",
      urgency: "urgent",
      budget_cents: 35_000_00
    )
    ServiceRequest.create!(
      client: client,
      service_category: other_category,
      title: "Pedido de outra categoria",
      description: "Estado certo, mas categoria diferente.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "urgent",
      budget_cents: 25_000_00
    )
    ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido de outra provincia",
      description: "Categoria e estado certos, mas provincia diferente.",
      location: "Lobito",
      province: "Benguela",
      status: "pending",
      urgency: "urgent",
      budget_cents: 25_000_00
    )
    ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido de outra urgencia",
      description: "Categoria, estado e provincia certos, mas urgencia diferente.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "normal",
      budget_cents: 25_000_00
    )

    sign_in users(:admin)
    get "/api/v1/service_requests",
      params: {
        status: "pending",
        category_slug: @category.slug,
        province: "Luanda",
        urgency: "urgent"
      },
      as: :json

    assert_response :success
    ids = JSON.parse(response.body).fetch("data").map { |request| request.fetch("id") }
    assert_equal [ matching_request.id ], ids
  end

  test "operational service request index orders priority queue before recency" do
    client = Client.create!(
      user: users(:client),
      name: "Cliente Prioridade API",
      phone: "+244 930 222 121",
      address: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona"
    )
    normal_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido normal mais recente",
      description: "Pedido normal criado depois dos urgentes.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "normal",
      budget_cents: 20_000_00,
      created_at: 1.minute.ago
    )
    urgent_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido urgente intermediario",
      description: "Pedido urgente deve aparecer antes do normal.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "urgent",
      budget_cents: 25_000_00,
      created_at: 2.minutes.ago
    )
    priority_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido prioritario antigo",
      description: "Pedido prioritario deve aparecer no topo da fila.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "priority",
      budget_cents: 30_000_00,
      created_at: 3.minutes.ago
    )

    sign_in users(:admin)
    get "/api/v1/service_requests",
      params: {
        status: "pending",
        category_slug: @category.slug,
        province: "Luanda"
      },
      as: :json

    assert_response :success
    ids = JSON.parse(response.body).fetch("data").map { |request| request.fetch("id") }
    assert_equal [ priority_request.id, urgent_request.id, normal_request.id ], ids
  end

  test "public professional search returns distance without exact coordinates" do
    professional = Professional.create!(
      name: "Tecnico Coordenadas",
      phone: "+244 930 222 200",
      email: "tecnico.coordenadas@example.com",
      specialty: "Tecnico de redes",
      bio: "Suporte tecnico para teste de privacidade.",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "verified",
      latitude: -8.9166,
      longitude: 13.1829
    )
    ProfessionalService.create!(professional: professional, service_category: @category)

    get "/api/v1/professionals/search",
      params: {
        category_slug: @category.slug,
        latitude: -8.9160,
        longitude: 13.1830
      },
      as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    professional_payload = payload.fetch("data").find { |item| item["id"] == professional.id }

    assert professional_payload.present?
    assert professional_payload["distance_km"].present?
    refute professional_payload.key?("coordinates")
    refute professional_payload.key?("contact")
  end

  test "public professional search excludes unverified professionals" do
    unverified = Professional.create!(
      name: "Tecnico Sem Verificacao",
      phone: "+244 930 222 210",
      email: "tecnico.sem.verificacao@example.com",
      specialty: "Tecnico de redes",
      bio: "Perfil ainda sem documentos aprovados.",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "pending",
      rating: 5,
      completed_jobs: 99
    )
    ProfessionalService.create!(professional: unverified, service_category: @category)

    get "/api/v1/professionals/search", params: { category_slug: @category.slug }, as: :json

    assert_response :success
    ids = JSON.parse(response.body).fetch("data").map { |professional| professional.fetch("id") }
    refute_includes ids, unverified.id
  end

  test "service request matches exclude unverified professionals" do
    client = Client.create!(
      user: users(:client),
      name: "Cliente Matching Seguro",
      phone: "+244 930 444 210",
      email: "cliente.matching.seguro@example.com",
      address: "Rua do cliente",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona"
    )
    service_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Rede sem sinal",
      description: "Internet instavel no escritorio.",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      budget_cents: 35_000_00
    )
    unverified = Professional.create!(
      name: "Tecnico Matching Sem Verificacao",
      phone: "+244 930 222 211",
      email: "tecnico.matching.sem.verificacao@example.com",
      specialty: "Tecnico de redes",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "pending",
      rating: 5,
      completed_jobs: 99
    )
    ProfessionalService.create!(professional: unverified, service_category: @category)

    sign_in users(:client)
    get "/api/v1/service_requests/#{service_request.id}/matches", as: :json

    assert_response :success
    ids = JSON.parse(response.body).fetch("data").map { |match| match.dig("professional", "id") }
    refute_includes ids, unverified.id
  end

  test "operational professional index can still include exact coordinates" do
    professional = Professional.create!(
      name: "Tecnico Operacao Coordenadas",
      phone: "+244 930 222 201",
      email: "tecnico.operacao.coordenadas@example.com",
      specialty: "Tecnico de redes",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "verified",
      latitude: -8.9166,
      longitude: 13.1829
    )
    ProfessionalService.create!(professional: professional, service_category: @category)

    sign_in users(:admin)
    get "/api/v1/professionals", params: { category_slug: @category.slug }, as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    professional_payload = payload.fetch("data").find { |item| item["id"] == professional.id }

    assert_in_delta(-8.9166, professional_payload.dig("coordinates", "latitude").to_f, 0.0001)
    assert_in_delta(13.1829, professional_payload.dig("coordinates", "longitude").to_f, 0.0001)
    assert_equal "+244 930 222 201", professional_payload.dig("contact", "phone")
  end

  test "professional jobs endpoint redacts private client data from pending requests" do
    professional_user = User.create!(
      name: "Profissional API",
      email: "profissional-api@example.com",
      password: "password123",
      role: "professional"
    )
    professional = Professional.create!(
      user: professional_user,
      name: "Tecnico API",
      phone: "+244 930 333 100",
      email: "tecnico-api@example.com",
      specialty: "Tecnico de redes",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "verified"
    )
    ProfessionalService.create!(professional: professional, service_category: @category)
    client = Client.create!(
      name: "Cliente Sensivel",
      phone: "+244 930 444 100",
      email: "cliente.sensivel@example.com",
      company_name: "Empresa Privada",
      address: "Rua privada 10",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      latitude: -8.9166,
      longitude: 13.1829
    )
    ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Router sem sinal",
      description: "Internet instavel no escritorio.",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      budget_cents: 35_000_00
    )

    sign_in professional_user
    get "/api/v1/professional_portal/jobs", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    request_payload = payload.fetch("data").first
    client_payload = request_payload.fetch("client")

    refute client_payload.key?("name")
    refute client_payload.key?("company_name")
    refute client_payload.key?("contact")
    refute client_payload.key?("address")
    refute client_payload.key?("coordinates")
    assert_equal "Luanda", client_payload["province"]
    assert_equal "Talatona", client_payload["municipality"]
    assert_equal "Talatona", client_payload["neighborhood"]
    assert_equal @category.slug, request_payload.dig("service_category", "slug")
  end

  test "unverified professional cannot list available jobs" do
    professional_user = User.create!(
      name: "Profissional Pendente Jobs",
      email: "profissional-pendente-jobs@example.com",
      password: "password123",
      role: "professional"
    )
    professional = Professional.create!(
      user: professional_user,
      name: "Tecnico Jobs Pendente",
      phone: "+244 930 333 150",
      email: "tecnico-jobs-pendente@example.com",
      specialty: "Tecnico de redes",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "pending"
    )
    ProfessionalService.create!(professional: professional, service_category: @category)
    ServiceRequest.create!(
      client: Client.create!(
        name: "Cliente Jobs Sensivel",
        phone: "+244 930 444 150",
        province: "Luanda",
        municipality: "Talatona",
        neighborhood: "Talatona"
      ),
      service_category: @category,
      title: "Pedido nao visivel para pendente",
      description: "Descricao operacional que so profissionais verificados devem ver.",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      budget_cents: 35_000_00
    )

    sign_in professional_user
    get "/api/v1/professional_portal/jobs", as: :json

    assert_response :forbidden
    assert_equal "professional_not_verified", JSON.parse(response.body).dig("error", "code")
  end

  test "assigned professional can still see private client data on assigned request detail" do
    professional_user = User.create!(
      name: "Profissional Atribuido API",
      email: "profissional-atribuido-api@example.com",
      password: "password123",
      role: "professional"
    )
    professional = Professional.create!(
      user: professional_user,
      name: "Tecnico Atribuido",
      phone: "+244 930 333 200",
      email: "tecnico-atribuido@example.com",
      specialty: "Tecnico de redes",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "online",
      documents_status: "verified"
    )
    client = Client.create!(
      name: "Cliente Atribuido",
      phone: "+244 930 444 200",
      email: "cliente.atribuido@example.com",
      address: "Rua atribuida 20",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      latitude: -8.9166,
      longitude: 13.1829
    )
    service_request = ServiceRequest.create!(
      client: client,
      professional: professional,
      service_category: @category,
      title: "Rede sem sinal",
      description: "Internet instavel no escritorio.",
      location: "Talatona",
      province: "Luanda",
      municipality: "Talatona",
      neighborhood: "Talatona",
      status: "assigned",
      budget_cents: 35_000_00
    )

    sign_in professional_user
    get "/api/v1/service_requests/#{service_request.id}", as: :json

    assert_response :success
    client_payload = JSON.parse(response.body).dig("data", "client")
    assert_equal "Cliente Atribuido", client_payload["name"]
    assert_equal "+244 930 444 200", client_payload.dig("contact", "phone")
    assert_equal "cliente.atribuido@example.com", client_payload.dig("contact", "email")
    assert_equal "Rua atribuida 20", client_payload["address"]
    assert client_payload["coordinates"].present?
  end

  test "dashboard api is restricted to operational users" do
    sign_in users(:client)
    get "/api/v1/dashboard", as: :json
    assert_response :forbidden

    sign_out users(:client)
    sign_in users(:admin)
    get "/api/v1/dashboard", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert payload.dig("data", "stats").key?("requests_count")
    assert payload.dig("data", "stats").key?("pending_requests_count")
    assert payload.dig("data", "stats").key?("assigned_requests_count")
    assert payload.dig("data", "stats").key?("disputed_requests_count")
    assert payload.dig("data", "stats").key?("professionals_available_count")
    assert payload.dig("data", "stats").key?("professionals_pending_docs_count")
    assert payload.dig("data", "stats").key?("overdue_requests_count")
    assert payload.dig("data", "stats").key?("sla_risk_requests_count")
    assert payload.dig("data", "stats").key?("average_response_minutes")
    assert payload.dig("data", "stats").key?("completion_rate_percent")
    assert payload.dig("data", "stats").key?("dispute_rate_percent")
    assert payload.dig("data", "stats").key?("average_quality_rating")
    assert payload.dig("data", "stats").key?("review_coverage_percent")
    assert_kind_of Hash, payload.dig("data", "service_quality")
    assert_kind_of Array, payload.dig("data", "risk_alerts")
    assert_kind_of Array, payload.dig("data", "audit_actions")
    assert_kind_of Array, payload.dig("data", "recent_audit_logs")
  end

  test "dashboard api returns service quality metrics and risk alerts" do
    now = Time.current
    client = Client.create!(
      name: "Cliente SLA",
      phone: "+244 930 777 300",
      address: "Talatona",
      province: "Luanda",
      municipality: "Talatona"
    )
    professional = Professional.create!(
      name: "Profissional SLA",
      phone: "+244 930 777 301",
      specialty: "Tecnico SLA",
      location: "Talatona",
      province: "Luanda",
      status: "online",
      documents_status: "verified"
    )
    professional.service_categories << @category

    overdue_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      professional: professional,
      title: "Pedido atrasado no SLA",
      description: "Pedido criado para validar alertas operacionais.",
      location: "Talatona",
      province: "Luanda",
      status: "assigned",
      urgency: "priority",
      budget_cents: 20_000_00,
      scheduled_at: now - 1.hour
    )
    overdue_request.update_columns(created_at: now - 6.hours, updated_at: now - 5.hours)

    stale_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      title: "Pedido pendente antigo",
      description: "Pedido pendente para validar risco de resposta.",
      location: "Talatona",
      province: "Luanda",
      status: "pending",
      urgency: "urgent",
      budget_cents: 18_000_00,
      scheduled_at: now + 1.hour
    )
    stale_request.update_columns(created_at: now - 3.hours, updated_at: now - 3.hours)

    completed_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      professional: professional,
      title: "Pedido concluido avaliado",
      description: "Pedido concluido para validar qualidade.",
      location: "Talatona",
      province: "Luanda",
      status: "completed",
      urgency: "normal",
      budget_cents: 30_000_00,
      scheduled_at: now - 2.days,
      accepted_at: now - 2.days + 45.minutes,
      completed_at: now - 1.day
    )
    completed_request.update_columns(created_at: now - 2.days, updated_at: now - 1.day)
    Review.create!(
      service_request: completed_request,
      professional: professional,
      client: client,
      quality: 5,
      punctuality: 4,
      communication: 5,
      comment: "Atendimento rapido."
    )

    sign_in users(:admin)
    get "/api/v1/dashboard", as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    stats = payload.dig("data", "stats")
    service_quality = payload.dig("data", "service_quality")
    alerts = payload.dig("data", "risk_alerts")

    assert_operator stats.fetch("overdue_requests_count"), :>=, 1
    assert_operator stats.fetch("sla_risk_requests_count"), :>=, 2
    assert_equal stats.fetch("overdue_requests_count"), service_quality.fetch("overdue_requests_count")
    assert_equal "critical", service_quality.fetch("status")
    assert_equal 45, service_quality.fetch("average_response_minutes")
    assert_equal 100, service_quality.fetch("completion_rate_percent")
    assert_equal 0, service_quality.fetch("dispute_rate_percent")
    assert_equal 5.0, service_quality.fetch("average_quality_rating")
    assert_equal 100, service_quality.fetch("review_coverage_percent")
    assert alerts.any? { |alert| alert.fetch("code") == overdue_request.code }
    assert alerts.any? { |alert| alert.fetch("code") == stale_request.code }
    assert alerts.all? { |alert| alert.key?("reason") && alert.key?("risk_level") && alert.key?("age_minutes") }
  end

  test "dashboard audit log feed supports action filter" do
    professional = Professional.create!(
      name: "Profissional Auditoria Dashboard",
      phone: "+244 930 777 220",
      specialty: "Tecnico auditoria",
      location: "Talatona",
      province: "Luanda",
      status: "online",
      documents_status: "verified"
    )
    client = Client.create!(
      user: users(:client),
      name: "Cliente Auditoria Dashboard",
      phone: "+244 930 777 221",
      address: "Talatona",
      province: "Luanda",
      municipality: "Talatona"
    )
    service_request = ServiceRequest.create!(
      client: client,
      service_category: @category,
      professional: professional,
      title: "Pedido auditado no dashboard",
      description: "Pedido para provar filtro de auditoria.",
      location: "Talatona",
      province: "Luanda",
      status: "assigned",
      urgency: "normal",
      budget_cents: 12_000_00
    )
    AuditLog.record!(
      action: "professional.operational_profile_updated",
      actor: users(:admin),
      auditable: professional,
      metadata: { previous_status: "offline", next_status: "online", notes_changed: true }
    )
    AuditLog.record!(
      action: "service_request.status_updated",
      actor: users(:admin),
      auditable: service_request,
      metadata: { previous_status: "pending", next_status: "assigned" }
    )

    sign_in users(:admin)
    get "/api/v1/dashboard",
      params: { audit_action: "service_request.status_updated" },
      as: :json

    assert_response :success
    logs = JSON.parse(response.body).dig("data", "recent_audit_logs")
    assert logs.present?
    assert logs.all? { |item| item.fetch("action") == "service_request.status_updated" }
    assert_equal service_request.id, logs.first.fetch("auditable_id")

    get "/api/v1/dashboard",
      params: { audit_action: "unknown.action" },
      as: :json

    assert_response :unprocessable_entity
    assert_equal "invalid_audit_action", JSON.parse(response.body).dig("error", "code")
  end

  private

  def upload_file(name = "document.pdf", content_type = "application/pdf")
    Rack::Test::UploadedFile.new(Rails.root.join("test/fixtures/files/#{name}"), content_type)
  end

  def large_pdf_upload(name, megabytes:)
    file = Tempfile.new([ File.basename(name, ".pdf"), ".pdf" ])
    file.binmode
    file.write("%PDF-1.4\n")
    file.truncate(megabytes.megabytes)
    file.rewind
    @large_upload_tempfiles << file

    Rack::Test::UploadedFile.new(file.path, "application/pdf", true)
  end

  def session_cookie_from_response
    raw_session_cookie&.split(";", 2)&.first&.split("=", 2)&.last
  end

  def session_cookie_expired?
    raw_cookie = raw_session_cookie.to_s.downcase
    raw_cookie.include?("max-age=0") || raw_cookie.include?("expires=thu, 01 jan 1970")
  end

  def assert_session_cookie_hardened(raw_cookie)
    cookie = raw_cookie.to_s.downcase
    assert_includes cookie, "httponly"
    assert_includes cookie, "samesite=#{Rails.application.config.session_options[:same_site]}"
    assert_includes cookie, "secure" if Rails.application.config.session_options[:secure]
  end

  def raw_session_cookie
    response.headers["Set-Cookie"].to_s.split(/,(?=\s*[^;,=\s]+=)/).reverse.find do |cookie|
      cookie.strip.start_with?("#{Rails.application.config.session_options[:key]}=")
    end
  end

  def capture_json_logs
    io = StringIO.new
    logger = ActiveSupport::Logger.new(io)
    previous_logger = Rails.logger

    begin
      Rails.logger = logger
      yield
    ensure
      Rails.logger = previous_logger
    end

    io.string.lines.filter_map do |line|
      JSON.parse(line)
    rescue JSON::ParserError
      nil
    end
  end
end
