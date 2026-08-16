require "test_helper"

class ProfessionalDocumentsTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @professional_user = User.create!(
      name: "Profissional Documentos",
      email: "profissional-documentos@example.com",
      password: "password123",
      role: "professional"
    )
    @professional = Professional.create!(
      user: @professional_user,
      name: "Profissional Documentos",
      phone: "+244 930 630 000",
      specialty: "Tecnico certificado",
      location: "Talatona",
      status: "offline",
      documents_status: "pending"
    )
    @operator = User.create!(
      name: "Operador Documentos",
      email: "operador-documentos@example.com",
      password: "password123",
      role: "operator"
    )
  end

  test "professional can upload own verification document" do
    sign_in @professional_user

    assert_difference "ProfessionalDocument.count", 1 do
      post "/api/v1/professional_portal/documents",
        params: { kind: "identity", file: upload_file },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :created
    document = ProfessionalDocument.last
    assert_equal @professional.id, document.professional_id
    assert_equal "identity", document.kind
    assert_equal "pending", document.status
    assert document.file.attached?
    assert_equal "pending", @professional.reload.documents_status

    response_data = JSON.parse(response.body).fetch("data")
    assert_equal "document.pdf", response_data.fetch("original_filename")
    assert_not response_data.key?("url")
  end

  test "client cannot upload professional documents" do
    sign_in users(:client)

    assert_no_difference "ProfessionalDocument.count" do
      post "/api/v1/professional_portal/documents",
        params: { kind: "identity", file: upload_file },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :forbidden
  end

  test "professional document index only lists the authenticated professional documents" do
    own_document = create_document!
    other_professional = create_other_professional!
    other_document = create_document!(professional: other_professional)
    sign_in @professional_user

    get "/api/v1/professional_portal/documents", as: :json

    assert_response :success
    document_ids = JSON.parse(response.body).fetch("data").map { |document| document.fetch("id") }
    assert_includes document_ids, own_document.id
    assert_not_includes document_ids, other_document.id
  end

  test "client professional detail does not expose verification documents" do
    create_document!
    AuditLog.record!(
      action: "professional.operational_profile_updated",
      actor: @operator,
      auditable: @professional,
      metadata: { previous_status: "offline", next_status: "online", notes_changed: true }
    )
    @professional.update!(documents_status: "verified", operator_notes: "Nota interna reservada.")
    sign_in users(:client)

    get "/api/v1/professionals/#{@professional.id}", as: :json

    assert_response :success
    professional = JSON.parse(response.body).fetch("data")
    assert_not professional.key?("documents")
    assert_not professional.key?("contact")
    assert_not professional.key?("operator_notes")
    assert_not professional.key?("operational_activity")
  end

  test "client cannot access unverified professional detail" do
    create_document!
    sign_in users(:client)

    get "/api/v1/professionals/#{@professional.id}", as: :json

    assert_response :forbidden
  end

  test "operator professional detail exposes document metadata without file URL" do
    document = create_document!
    @professional.update!(operator_notes: "Validar certificado ate sexta-feira.")
    AuditLog.record!(
      action: "professional_document.reviewed",
      actor: @operator,
      auditable: document,
      metadata: {
        professional_id: @professional.id,
        document_kind: document.kind,
        previous_status: "pending",
        next_status: "approved"
      }
    )
    sign_in @operator

    get "/api/v1/professionals/#{@professional.id}", as: :json

    assert_response :success
    professional = JSON.parse(response.body).fetch("data")
    assert_equal "Validar certificado ate sexta-feira.", professional.fetch("operator_notes")
    activity = professional.fetch("operational_activity")
    assert activity.any? { |item| item.fetch("action") == "professional_document.reviewed" }

    documents = professional.fetch("documents")
    payload = documents.find { |item| item.fetch("id") == document.id }
    assert payload.present?
    assert_equal "document.pdf", payload.fetch("original_filename")
    assert_not payload.key?("url")
    assert_not payload.key?("signed_id")
    assert_not payload.key?("file")
  end

  test "operator can update professional operational notes and status" do
    sign_in @operator

    assert_difference "AuditLog.where(action: 'professional.operational_profile_updated').count", 1 do
      patch "/api/v1/professionals/#{@professional.id}/operational_profile",
        params: {
          professional: {
            status: "suspended",
            operator_notes: "Suspenso ate reenviar documentos."
          }
        },
        as: :json
    end

    assert_response :success
    @professional.reload
    assert_equal "suspended", @professional.status
    assert_equal "Suspenso ate reenviar documentos.", @professional.operator_notes

    payload = JSON.parse(response.body).fetch("data")
    assert_equal "suspended", payload.fetch("status")
    assert_equal "Suspenso ate reenviar documentos.", payload.fetch("operator_notes")
    assert payload.fetch("operational_activity").any? { |item| item.fetch("action") == "professional.operational_profile_updated" }

    audit_log = AuditLog.where(action: "professional.operational_profile_updated").last
    assert_equal @operator, audit_log.actor
    assert_equal @professional, audit_log.auditable
    assert_equal "offline", audit_log.metadata.fetch("previous_status")
    assert_equal "suspended", audit_log.metadata.fetch("next_status")
    assert_equal true, audit_log.metadata.fetch("notes_changed")
  end

  test "client cannot update professional operational profile" do
    sign_in users(:client)

    assert_no_difference "AuditLog.count" do
      patch "/api/v1/professionals/#{@professional.id}/operational_profile",
        params: {
          professional: {
            status: "suspended",
            operator_notes: "Tentativa indevida."
          }
        },
        as: :json
    end

    assert_response :forbidden
    assert_equal "offline", @professional.reload.status
    assert_nil @professional.operator_notes
  end

  test "operator can filter professional index by status documents and category" do
    category = ServiceCategory.create!(
      name: "Documentos API",
      slug: "documentos-api",
      description: "Categoria para filtro operacional.",
      base_price_cents: 25_000_00,
      average_duration_minutes: 60
    )
    other_category = ServiceCategory.create!(
      name: "Outra Documentos API",
      slug: "outra-documentos-api",
      description: "Outra categoria para filtro operacional.",
      base_price_cents: 30_000_00,
      average_duration_minutes: 75
    )
    ProfessionalService.create!(professional: @professional, service_category: category)

    rejected_professional = create_other_professional!
    rejected_professional.update!(status: "offline", documents_status: "rejected")
    ProfessionalService.create!(professional: rejected_professional, service_category: category)

    outside_category_professional = Professional.create!(
      name: "Profissional Outra Categoria",
      phone: "+244 930 630 002",
      specialty: "Tecnico certificado",
      location: "Talatona",
      status: "offline",
      documents_status: "pending"
    )
    ProfessionalService.create!(professional: outside_category_professional, service_category: other_category)

    sign_in @operator
    get "/api/v1/professionals",
      params: {
        status: "offline",
        documents_status: "pending",
        category_slug: category.slug
      },
      as: :json

    assert_response :success
    ids = JSON.parse(response.body).fetch("data").map { |professional| professional.fetch("id") }
    assert_equal [ @professional.id ], ids
  end

  test "invalid file type is rejected" do
    sign_in @professional_user

    assert_no_difference "ProfessionalDocument.count" do
      post "/api/v1/professional_portal/documents",
        params: { kind: "identity", file: upload_file("document.txt", "text/plain") },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :unprocessable_entity
  end

  test "spoofed document content type is rejected" do
    sign_in @professional_user

    assert_no_difference "ProfessionalDocument.count" do
      post "/api/v1/professional_portal/documents",
        params: { kind: "identity", file: upload_file("document.txt", "application/pdf") },
        headers: { "ACCEPT" => "application/json" }
    end

    assert_response :unprocessable_entity
  end

  test "operator approval keeps professional pending until all document kinds are approved" do
    document = create_document!
    sign_in @operator

    assert_difference "AuditLog.count", 1 do
      patch "/api/v1/professional_documents/#{document.id}/review",
        params: { status: "approved", review_notes: "Documento legivel." },
        as: :json
    end

    assert_response :success
    document.reload
    assert_equal "approved", document.status
    assert_equal @operator.id, document.reviewed_by_id
    assert_equal "pending", @professional.reload.documents_status

    audit_log = AuditLog.last
    assert_equal "professional_document.reviewed", audit_log.action
    assert_equal @operator, audit_log.actor
    assert_equal document, audit_log.auditable
    assert_equal @professional.id, audit_log.metadata.fetch("professional_id")
    assert_equal "identity", audit_log.metadata.fetch("document_kind")
    assert_equal "pending", audit_log.metadata.fetch("previous_status")
    assert_equal "approved", audit_log.metadata.fetch("next_status")
    assert_equal "pending", audit_log.metadata.fetch("previous_professional_documents_status")
    assert_equal "pending", audit_log.metadata.fetch("next_professional_documents_status")
  end

  test "operator can verify professional after approving all required document kinds" do
    identity = create_document!(kind: "identity")
    certificate = create_document!(kind: "certificate")
    license = create_document!(kind: "license")
    sign_in @operator

    [ identity, certificate, license ].each do |document|
      patch "/api/v1/professional_documents/#{document.id}/review",
        params: { status: "approved", review_notes: "Documento legivel." },
        as: :json

      assert_response :success
    end

    assert_equal "verified", @professional.reload.documents_status
  end

  test "operator can reject uploaded document and mark professional as rejected" do
    document = create_document!
    sign_in @operator

    patch "/api/v1/professional_documents/#{document.id}/review",
      params: { status: "rejected", review_notes: "Imagem ilegivel." },
      as: :json

    assert_response :success
    assert_equal "rejected", document.reload.status
    assert_equal "rejected", @professional.reload.documents_status
  end

  test "professional cannot review own document" do
    document = create_document!
    sign_in @professional_user

    patch "/api/v1/professional_documents/#{document.id}/review",
      params: { status: "approved" },
      as: :json

    assert_response :forbidden
    assert_equal "pending", document.reload.status
  end

  test "client cannot review professional document" do
    document = create_document!
    sign_in users(:client)

    patch "/api/v1/professional_documents/#{document.id}/review",
      params: { status: "approved" },
      as: :json

    assert_response :forbidden
    assert_equal "pending", document.reload.status
  end

  private

  def create_document!(kind: "identity", professional: @professional)
    document = professional.professional_documents.build(
      kind: kind,
      original_filename: "document.pdf",
      content_type: "application/pdf",
      byte_size: File.size(Rails.root.join("test/fixtures/files/document.pdf")),
      status: "pending"
    )
    document.file.attach(upload_file)
    document.save!
    document
  end

  def create_other_professional!
    user = User.create!(
      name: "Outro Profissional Documentos",
      email: "outro-profissional-documentos@example.com",
      password: "password123",
      role: "professional"
    )
    Professional.create!(
      user: user,
      name: "Outro Profissional Documentos",
      phone: "+244 930 630 001",
      specialty: "Tecnico certificado",
      location: "Talatona",
      status: "offline",
      documents_status: "pending"
    )
  end

  def upload_file(name = "document.pdf", content_type = "application/pdf")
    Rack::Test::UploadedFile.new(Rails.root.join("test/fixtures/files/#{name}"), content_type)
  end
end
