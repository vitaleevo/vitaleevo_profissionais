class ServiceRequestAttachment < ApplicationRecord
  ALLOWED_CONTENT_TYPES = %w[application/pdf image/jpeg image/png image/webp].freeze
  MAX_ATTACHMENTS_PER_REQUEST = 5
  MAX_FILE_SIZE = 8.megabytes
  MAX_TOTAL_FILE_SIZE = 20.megabytes

  belongs_to :service_request

  has_one_attached :file

  validates :original_filename, :content_type, :byte_size, presence: true
  validates :content_type, inclusion: { in: ALLOWED_CONTENT_TYPES }
  validates :byte_size, numericality: { greater_than: 0, less_than_or_equal_to: MAX_FILE_SIZE }
  validate :file_is_attached

  scope :recent, -> { order(created_at: :desc) }

  private

  def file_is_attached
    errors.add(:file, "deve ser anexado") unless file.attached?
  end
end
