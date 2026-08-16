class ServiceRequest < ApplicationRecord
  STATUSES = %w[pending assigned accepted in_progress completed cancelled disputed].freeze
  URGENCIES = %w[normal urgent priority].freeze
  OPERATIONAL_QUEUE_ORDER_SQL = <<~SQL.squish.freeze
    CASE service_requests.urgency
      WHEN 'priority' THEN 0
      WHEN 'urgent' THEN 1
      ELSE 2
    END ASC,
    CASE service_requests.status
      WHEN 'disputed' THEN 0
      WHEN 'pending' THEN 1
      WHEN 'assigned' THEN 2
      WHEN 'accepted' THEN 3
      WHEN 'in_progress' THEN 4
      WHEN 'completed' THEN 5
      ELSE 6
    END ASC,
    service_requests.created_at DESC
  SQL

  before_validation :normalize_administrative_location

  belongs_to :client
  belongs_to :service_category
  belongs_to :professional, optional: true

  has_many :payments, dependent: :destroy
  has_many :service_request_attachments, dependent: :destroy
  has_one :review, dependent: :destroy

  before_validation :assign_code, on: :create

  validates :code, :title, :description, :location, presence: true
  validates :code, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :urgency, inclusion: { in: URGENCIES }
  validates :budget_cents, numericality: { greater_than_or_equal_to: 0 }

  scope :recent, -> { order(created_at: :desc) }
  scope :operational_queue, -> { order(Arel.sql(OPERATIONAL_QUEUE_ORDER_SQL)) }
  scope :open, -> { where(status: %w[pending assigned accepted in_progress]) }

  def urgent?
    urgency != "normal"
  end

  def assign_to!(matched_professional)
    update!(
      professional: matched_professional,
      status: "assigned"
    )
  end

  private

  def assign_code
    self.code ||= "OS-#{Time.current.strftime('%y%m%d')}-#{SecureRandom.hex(3).upcase}"
  end

  def normalize_administrative_location
    AngolaLocations.normalize_record(self)
  end
end
