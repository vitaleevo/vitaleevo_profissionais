require "test_helper"

class PaymentTest < ActiveSupport::TestCase
  setup do
    @category = ServiceCategory.create!(
      name: "Pagamento modelo",
      slug: "pagamento-modelo",
      base_price_cents: 20_000_00,
      average_duration_minutes: 60
    )
    @client = Client.create!(name: "Cliente Pagamento", phone: "+244 930 750 001")
    @service_request = ServiceRequest.create!(
      client: @client,
      service_category: @category,
      title: "Pedido para pagamento",
      description: "Validar integridade de split financeiro.",
      location: "Talatona",
      status: "completed",
      budget_cents: 20_000_00
    )
  end

  test "calculates default split from amount" do
    payment = Payment.create!(
      service_request: @service_request,
      amount_cents: 20_000_00,
      status: "paid",
      paid_at: Time.current
    )

    assert_equal 3_000_00, payment.commission_cents
    assert_equal 17_000_00, payment.professional_payout_cents
  end

  test "accepts explicit split that matches amount" do
    payment = Payment.create!(
      service_request: @service_request,
      amount_cents: 20_000_00,
      commission_cents: 2_500_00,
      professional_payout_cents: 17_500_00,
      status: "paid",
      paid_at: Time.current
    )

    assert_equal 20_000_00, payment.amount_cents
    assert_equal 2_500_00, payment.commission_cents
    assert_equal 17_500_00, payment.professional_payout_cents
  end

  test "rejects split that exceeds payment amount" do
    payment = Payment.new(
      service_request: @service_request,
      amount_cents: 20_000_00,
      commission_cents: 5_000_00,
      professional_payout_cents: 20_000_00,
      status: "paid",
      paid_at: Time.current
    )

    assert_not payment.valid?
    assert_includes payment.errors[:base], "Split financeiro deve fechar com o valor do pagamento."
  end
end
