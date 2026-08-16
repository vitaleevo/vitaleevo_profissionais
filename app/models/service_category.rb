class ServiceCategory < ApplicationRecord
  has_many :professional_services, dependent: :destroy
  has_many :professionals, through: :professional_services
  has_many :service_requests, dependent: :restrict_with_exception

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true
  validates :base_price_cents, :average_duration_minutes, numericality: { greater_than_or_equal_to: 0 }
end
