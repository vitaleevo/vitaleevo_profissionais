class Professional < ApplicationRecord
  STATUSES = %w[online offline occupied suspended].freeze
  DOCUMENT_STATUSES = %w[pending verified rejected].freeze

  before_validation :normalize_administrative_location

  belongs_to :user, optional: true

  has_many :professional_services, dependent: :destroy
  has_many :service_categories, through: :professional_services
  has_many :professional_documents, dependent: :destroy
  has_many :service_requests, dependent: :nullify
  has_many :payments, through: :service_requests
  has_many :reviews, dependent: :destroy

  validates :name, :phone, :specialty, :location, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :documents_status, inclusion: { in: DOCUMENT_STATUSES }
  validates :hourly_rate_cents, :experience_years, :completed_jobs, numericality: { greater_than_or_equal_to: 0 }
  validates :operator_notes, length: { maximum: 2_000 }, allow_blank: true

  scope :active, -> { where.not(status: "suspended") }
  scope :verified, -> { where(documents_status: "verified") }
  scope :publicly_listed, -> { active.verified }
  scope :available, -> { where(status: "online", documents_status: "verified") }

  def available_for?(category)
    status == "online" && documents_status == "verified" && service_categories.exists?(id: category.id)
  end

  def publicly_listed?
    status != "suspended" && documents_status == "verified"
  end

  def assignable_to?(service_request)
    publicly_listed? && service_categories.exists?(id: service_request.service_category_id)
  end

  private

  def normalize_administrative_location
    AngolaLocations.normalize_record(self)
  end
end
