class AddPaymentSplitIntegrityConstraint < ActiveRecord::Migration[8.1]
  def change
    add_check_constraint :payments,
      "commission_cents + professional_payout_cents = amount_cents",
      name: "payments_split_matches_amount"
  end
end
