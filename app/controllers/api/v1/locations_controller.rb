module Api
  module V1
    class LocationsController < BaseController
      skip_before_action :authenticate_user!, only: :angola

      def angola
        render json: {
          data: {
            provinces: AngolaLocations::PROVINCES,
            municipalities_by_province: AngolaLocations::MUNICIPALITIES_BY_PROVINCE,
            neighborhoods_by_municipality: AngolaLocations::NEIGHBORHOODS_BY_MUNICIPALITY,
            territory: AngolaLocations.territory
          }
        }
      end
    end
  end
end
