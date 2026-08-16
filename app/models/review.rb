class Review < ApplicationRecord
  belongs_to :service_request
  belongs_to :professional
  belongs_to :client

  validates :quality, :punctuality, :communication, inclusion: { in: 1..5 }
  validates :service_request_id, uniqueness: true

  scope :publicly_visible, -> { joins(:professional).merge(Professional.publicly_listed) }

  after_commit :refresh_professional_ratings

  def average
    (quality + punctuality + communication) / 3.0
  end

  def self.refresh_professional_ratings!(professional)
    reviews = professional.reviews

    if reviews.exists?
      professional.update!(
        rating: reviews.average("(quality + punctuality + communication) / 3.0").to_f.round(2),
        quality_rating: reviews.average(:quality).to_f.round(2),
        punctuality_rating: reviews.average(:punctuality).to_f.round(2),
        communication_rating: reviews.average(:communication).to_f.round(2)
      )
    else
      professional.update!(
        rating: 0,
        quality_rating: 0,
        punctuality_rating: 0,
        communication_rating: 0
      )
    end
  end

  private

  def refresh_professional_ratings
    self.class.refresh_professional_ratings!(professional)
  end
end
