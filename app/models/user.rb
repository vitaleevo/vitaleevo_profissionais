class User < ApplicationRecord
  ROLES = %w[admin operator professional client].freeze

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :timeoutable, :validatable

  has_one :client, dependent: :nullify
  has_one :professional, dependent: :nullify
  has_many :audit_logs, foreign_key: :actor_id, dependent: :nullify, inverse_of: :actor
  has_many :reviewed_professional_documents, class_name: "ProfessionalDocument", foreign_key: :reviewed_by_id, dependent: :nullify

  validates :role, inclusion: { in: ROLES }
  validates :name, presence: true

  scope :active, -> { where(active: true) }

  ROLES.each do |role_name|
    define_method("#{role_name}?") do
      role == role_name
    end
  end

  def operational?
    admin? || operator?
  end

  def display_name
    name.presence || email
  end

  def active_for_authentication?
    super && active?
  end

  def inactive_message
    active? ? super : :inactive
  end
end
