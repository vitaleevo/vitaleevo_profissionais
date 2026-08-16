require "test_helper"

class ServiceRequests::UpdateStatusTest < ActiveSupport::TestCase
  setup do
    @category = ServiceCategory.create!(
      name: "TI status test",
      slug: "ti-status-test",
      base_price_cents: 40_000_00,
      average_duration_minutes: 90
    )
    @professional_user = User.create!(
      name: "Profissional Status",
      email: "profissional-status@example.com",
      password: "password123",
      role: "professional"
    )
    @professional = Professional.create!(
      user: @professional_user,
      name: "Tecnico Status",
      phone: "+244 930 500 001",
      specialty: "Tecnico de redes",
      location: "Talatona",
      status: "online",
      documents_status: "verified"
    )
    @client = Client.create!(name: "Cliente Status", phone: "+244 930 500 002")
    @service_request = ServiceRequest.create!(
      client: @client,
      professional: @professional,
      service_category: @category,
      title: "Rede instavel",
      description: "Precisa de suporte tecnico.",
      location: "Talatona",
      status: "assigned",
      budget_cents: 35_000_00
    )
  end

  test "assigned professional cannot complete request or create paid payment" do
    assert_no_difference "AuditLog.count" do
      assert_no_difference "Payment.count" do
        assert_raises(Pundit::NotAuthorizedError) do
          ServiceRequests::UpdateStatus.new(
            service_request: @service_request,
            status: "completed",
            user: @professional_user
          ).call
        end
      end
    end

    @service_request.reload
    assert_equal "assigned", @service_request.status
    assert_nil @service_request.completed_at
  end

  test "assigned professional can update non-payment workflow statuses" do
    assert_difference "AuditLog.count", 1 do
      ServiceRequests::UpdateStatus.new(
        service_request: @service_request,
        status: "accepted",
        user: @professional_user
      ).call
    end

    @service_request.reload
    assert_equal "accepted", @service_request.status
    assert_not_nil @service_request.accepted_at
    assert_empty @service_request.payments

    audit_log = AuditLog.last
    assert_equal "service_request.status_updated", audit_log.action
    assert_equal @professional_user, audit_log.actor
    assert_equal @service_request, audit_log.auditable
    assert_equal "assigned", audit_log.metadata.fetch("previous_status")
    assert_equal "accepted", audit_log.metadata.fetch("next_status")
  end

  test "rejected assigned professional cannot update workflow statuses" do
    @professional.update!(documents_status: "rejected")

    assert_raises(Pundit::NotAuthorizedError) do
      ServiceRequests::UpdateStatus.new(
        service_request: @service_request,
        status: "accepted",
        user: @professional_user
      ).call
    end

    @service_request.reload
    assert_equal "assigned", @service_request.status
    assert_nil @service_request.accepted_at
  end

  test "operational user can complete request and create paid payment" do
    assert_difference "AuditLog.count", 1 do
      assert_difference "Payment.count", 1 do
        ServiceRequests::UpdateStatus.new(
          service_request: @service_request,
          status: "completed",
          user: users(:admin)
        ).call
      end
    end

    payment = @service_request.reload.payments.last
    assert_equal "completed", @service_request.status
    assert_not_nil @service_request.completed_at
    assert_equal "paid", payment.status
    assert_equal @service_request.budget_cents, payment.amount_cents
  end
end
