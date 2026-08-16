class Client < ApplicationRecord
  before_validation :normalize_administrative_location

  belongs_to :user, optional: true

  has_many :service_requests, dependent: :restrict_with_exception
  has_many :reviews, dependent: :destroy

  validates :name, :phone, presence: true

  private

  def normalize_administrative_location
    AngolaLocations.normalize_record(self)
  end
end
