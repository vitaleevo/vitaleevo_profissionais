class MatchingService
  Match = Struct.new(
    :professional,
    :score,
    :distance_km,
    :rating_score,
    :proximity_score,
    :availability_score,
    :experience_score,
    keyword_init: true
  )

  def initialize(service_request)
    @service_request = service_request
  end

  def call(limit: 5)
    candidates.map { |professional| build_match(professional) }
      .sort_by { |match| -match.score }
      .first(limit)
  end

  private

  attr_reader :service_request

  def candidates
    service_request.service_category.professionals.publicly_listed.includes(:service_categories)
  end

  def build_match(professional)
    distance = distance_between(service_request, professional)
    rating_score = percentage(professional.rating.to_f, 5)
    proximity_score = [ 100 - (distance * 8), 0 ].max
    availability_score = availability_for(professional)
    experience_score = [ professional.experience_years * 12.5, 100 ].min

    Match.new(
      professional: professional,
      score: (
        (rating_score * 0.4) +
        (proximity_score * 0.3) +
        (availability_score * 0.2) +
        (experience_score * 0.1)
      ).round(1),
      distance_km: distance.round(1),
      rating_score: rating_score.round(1),
      proximity_score: proximity_score.round(1),
      availability_score: availability_score.round(1),
      experience_score: experience_score.round(1)
    )
  end

  def availability_for(professional)
    return 100 if professional.available_for?(service_request.service_category)
    return 50 if professional.status == "offline" && professional.documents_status == "verified"
    return 20 if professional.status == "occupied"

    0
  end

  def percentage(value, max)
    return 0 if max.zero?

    (value / max) * 100
  end

  def distance_between(origin, target)
    return fallback_distance(origin, target) unless coordinates?(origin) && coordinates?(target)

    earth_radius_km = 6371.0
    lat1 = radians(origin.latitude.to_f)
    lat2 = radians(target.latitude.to_f)
    delta_lat = radians(target.latitude.to_f - origin.latitude.to_f)
    delta_lon = radians(target.longitude.to_f - origin.longitude.to_f)

    a = Math.sin(delta_lat / 2)**2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(delta_lon / 2)**2

    earth_radius_km * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
  end

  def fallback_distance(origin, target)
    return 2.0 if AngolaLocations.equivalent?(origin.neighborhood, target.neighborhood)
    return 6.0 if AngolaLocations.equivalent?(origin.municipality, target.municipality)
    return 18.0 if AngolaLocations.equivalent?(origin.province, target.province)

    80.0
  end

  def coordinates?(record)
    record.latitude.present? && record.longitude.present?
  end

  def radians(value)
    value * Math::PI / 180
  end
end
