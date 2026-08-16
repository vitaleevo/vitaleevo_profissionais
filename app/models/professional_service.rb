class ProfessionalService < ApplicationRecord
  belongs_to :professional
  belongs_to :service_category

  validates :service_category_id, uniqueness: { scope: :professional_id }
end
