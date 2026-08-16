class ProfessionalDocument < ApplicationRecord
  KINDS = %w[identity certificate license].freeze
  STATUSES = %w[pending approved rejected].freeze

  belongs_to :professional
  belongs_to :reviewed_by, class_name: "User", optional: true

  has_one_attached :file

  validates :kind, inclusion: { in: KINDS }
  validates :status, inclusion: { in: STATUSES }
  validates :original_filename, :content_type, :byte_size, presence: true
  validates :byte_size, numericality: { greater_than: 0 }
  validate :file_is_attached

  scope :recent, -> { order(created_at: :desc) }

  def self.refresh_professional_status!(professional)
    latest_documents_by_kind = professional.professional_documents.order(:created_at).group_by(&:kind).transform_values(&:last)
    latest_documents = latest_documents_by_kind.values
    next_status =
      if latest_documents.any? { |document| document.status == "rejected" }
        "rejected"
      elsif KINDS.all? { |kind| latest_documents_by_kind[kind]&.status == "approved" }
        "verified"
      else
        "pending"
      end

    professional.update!(documents_status: next_status)
  end

  private

  def file_is_attached
    errors.add(:file, "deve ser anexado") unless file.attached?
  end
end
