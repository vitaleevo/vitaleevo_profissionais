class Notification < ApplicationRecord
  CHANNELS = %w[email sms push whatsapp].freeze

  validates :recipient_name, :event, :title, presence: true
  validates :channel, inclusion: { in: CHANNELS }

  scope :unread, -> { where(read_at: nil) }
end
