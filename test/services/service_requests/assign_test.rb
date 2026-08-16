require "test_helper"

class ServiceRequests::AssignTest < ActiveSupport::TestCase
  setup do
    @category = ServiceCategory.create!(
      name: "TI assign test",
      slug: "ti-assign-test",
      base_price_cents: 40_000_00,
      average_duration_minutes: 90
    )
    @other_category = ServiceCategory.create!(
      name: "Canalizacao assign test",
      slug: "canalizacao-assign-test",
      base_price_cents: 35_000_00,
      average_duration_minutes: 120
    )
    @client = Client.create!(name: "Cliente Assign", phone: "+244 930 520 001")
    @service_request = ServiceRequest.create!(
      client: @client,
      service_category: @category,
      title: "Rede instavel",
      description: "Precisa de suporte tecnico.",
      location: "Talatona",
      status: "pending",
      budget_cents: 35_000_00
    )
  end

  test "assigns verified active professional in request category" do
    professional = professional_for(
      name: "Tecnico Assign Verificado",
      documents_status: "verified",
      status: "online",
      category: @category
    )

    assert_difference "AuditLog.count", 1 do
      assert_difference "Notification.count", 1 do
        ServiceRequests::Assign.new(service_request: @service_request, professional: professional, actor: users(:admin)).call
      end
    end

    @service_request.reload
    assert_equal professional, @service_request.professional
    assert_equal "assigned", @service_request.status

    audit_log = AuditLog.last
    assert_equal "service_request.assigned", audit_log.action
    assert_equal users(:admin), audit_log.actor
    assert_equal @service_request, audit_log.auditable
    assert_equal professional.id, audit_log.metadata.fetch("professional_id")
    assert_nil audit_log.metadata.fetch("previous_professional_id")
    assert_equal "pending", audit_log.metadata.fetch("previous_status")
    assert_equal "assigned", audit_log.metadata.fetch("next_status")
  end

  test "rejects unverified professional assignment" do
    professional = professional_for(
      name: "Tecnico Assign Pendente",
      documents_status: "pending",
      status: "online",
      category: @category
    )

    assert_no_difference "AuditLog.count" do
      assert_no_difference "Notification.count" do
        assert_raises(ActiveRecord::RecordInvalid) do
          ServiceRequests::Assign.new(service_request: @service_request, professional: professional).call
        end
      end
    end

    @service_request.reload
    assert_nil @service_request.professional_id
    assert_equal "pending", @service_request.status
  end

  test "rejects professional outside request category" do
    professional = professional_for(
      name: "Tecnico Assign Outra Categoria",
      documents_status: "verified",
      status: "online",
      category: @other_category
    )

    assert_no_difference "AuditLog.count" do
      assert_no_difference "Notification.count" do
        assert_raises(ActiveRecord::RecordInvalid) do
          ServiceRequests::Assign.new(service_request: @service_request, professional: professional).call
        end
      end
    end

    @service_request.reload
    assert_nil @service_request.professional_id
    assert_equal "pending", @service_request.status
  end

  private

  def professional_for(name:, documents_status:, status:, category:)
    professional = Professional.create!(
      name: name,
      phone: "+244 930 520 010",
      specialty: "Tecnico de redes",
      location: "Talatona",
      status: status,
      documents_status: documents_status
    )
    ProfessionalService.create!(professional: professional, service_category: category)
    professional
  end
end
