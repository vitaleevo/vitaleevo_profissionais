class Payment < ApplicationRecord
  METHODS = %w[multicaixa_express unitel_money reference stripe paypal cash].freeze
  STATUSES = %w[pending paid refunded failed].freeze

  belongs_to :service_request

  validates :method, inclusion: { in: METHODS }
  validates :status, inclusion: { in: STATUSES }
  validates :amount_cents, :commission_cents, :professional_payout_cents, numericality: { greater_than_or_equal_to: 0 }
  validate :split_matches_amount

  before_validation :calculate_split

  private

  def calculate_split
    return unless amount_cents.positive?

    if commission_cents.zero? && professional_payout_cents.zero?
      self.commission_cents = (amount_cents * 0.15).round
      self.professional_payout_cents = amount_cents - commission_cents
    elsif professional_payout_cents.zero? && commission_cents <= amount_cents
      self.professional_payout_cents = amount_cents - commission_cents
    elsif commission_cents.zero? && professional_payout_cents <= amount_cents
      self.commission_cents = amount_cents - professional_payout_cents
    end
  end

  def split_matches_amount
    return if [ amount_cents, commission_cents, professional_payout_cents ].any?(&:nil?)
    return if commission_cents + professional_payout_cents == amount_cents

    errors.add(:base, "Split financeiro deve fechar com o valor do pagamento.")
  end
end
