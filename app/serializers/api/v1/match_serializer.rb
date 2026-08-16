module Api
  module V1
    class MatchSerializer
      def self.call(match, include_contact: false, include_coordinates: false)
        {
          professional: ProfessionalSerializer.call(
            match.professional,
            detail: false,
            include_contact: include_contact,
            include_coordinates: include_coordinates
          ),
          score: match.score,
          distance_km: match.distance_km,
          rating_score: match.rating_score,
          proximity_score: match.proximity_score,
          availability_score: match.availability_score,
          experience_score: match.experience_score
        }
      end
    end
  end
end
