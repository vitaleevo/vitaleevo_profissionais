module Api
  module V1
    class ProfessionalsController < BaseController
      LOCATION_FILTER_COLUMNS = {
        province: :province,
        municipality: :municipality,
        neighborhood: :neighborhood
      }.freeze

      skip_before_action :authenticate_user!, only: :search

      def search
        professionals = Professional.includes(:service_categories).publicly_listed.order(rating: :desc, completed_jobs: :desc)
        professionals = filter_by_category(professionals)
        professionals = filter_by_location(professionals, :province, params[:province])
        professionals = filter_by_location(professionals, :municipality, params[:municipality])
        professionals = filter_by_location(professionals, :neighborhood, params[:neighborhood])

        results = professionals.distinct.map { |professional| public_search_payload(professional) }
        results = apply_radius(results)
        results = sort_results(results)

        render json: { data: results.first(80) }
      end

      def index
        authorize Professional
        professionals = policy_scope(Professional).includes(:service_categories).active.order(rating: :desc, completed_jobs: :desc)
        professionals = professionals.joins(:service_categories).where(service_categories: { slug: params[:category_slug] }) if params[:category_slug].present?
        professionals = professionals.where(status: params[:status]) if current_user.operational? && params[:status].present?
        professionals = professionals.where(documents_status: params[:documents_status]) if current_user.operational? && params[:documents_status].present?

        render json: {
          data: professionals.distinct.map { |professional|
            Api::V1::ProfessionalSerializer.call(
              professional,
              include_contact: current_user.operational?,
              include_coordinates: current_user.operational?
            )
          }
        }
      end

      def show
        professional = Professional.includes(:service_categories, professional_documents: :reviewed_by).find(params[:id])
        authorize professional

        include_private_profile = current_user.operational? || professional.user_id == current_user.id
        include_operational_profile = current_user.operational?
        render json: {
          data: Api::V1::ProfessionalSerializer.call(
            professional,
            detail: true,
            include_contact: include_private_profile,
            include_coordinates: include_private_profile,
            include_documents: include_private_profile,
            include_operational_profile: include_operational_profile
          )
        }
      end

      def update_operational_profile
        professional = Professional.includes(:service_categories, professional_documents: :reviewed_by).find(params[:id])
        authorize professional, :update_operations?

        previous_status = professional.status
        previous_operator_notes = professional.operator_notes
        professional.assign_attributes(operational_profile_params)

        ActiveRecord::Base.transaction do
          professional.save!
          AuditLog.record!(
            action: "professional.operational_profile_updated",
            actor: current_user,
            auditable: professional,
            metadata: {
              previous_status: previous_status,
              next_status: professional.status,
              notes_changed: previous_operator_notes.to_s != professional.operator_notes.to_s
            }
          )
        end

        updated_professional = Professional.includes(:service_categories, professional_documents: :reviewed_by).find(professional.id)

        render json: {
          data: Api::V1::ProfessionalSerializer.call(
            updated_professional,
            detail: true,
            include_contact: true,
            include_coordinates: true,
            include_documents: true,
            include_operational_profile: true
          )
        }
      end

      private

      def operational_profile_params
        params.require(:professional).permit(:status, :operator_notes)
      end

      def filter_by_category(scope)
        return scope if params[:category_slug].blank?

        scope.joins(:service_categories).where(service_categories: { slug: params[:category_slug] })
      end

      def filter_by_location(scope, column, value)
        return scope if value.blank?

        canonical_value = canonical_location_value(column, value) || value.to_s
        exact = canonical_value.downcase
        match = "%#{ActiveRecord::Base.sanitize_sql_like(exact)}%"
        location_column = LOCATION_FILTER_COLUMNS[column]

        return scope.where(lower(Professional.arel_table[:location]).matches(match)) unless location_column

        target = lower(Professional.arel_table[location_column])
        location = lower(Professional.arel_table[:location])
        scope.where(target.eq(exact).or(target.matches(match)).or(location.matches(match)))
      end

      def canonical_location_value(column, value)
        case column
        when :province
          AngolaLocations.canonical_province(value)
        when :municipality
          AngolaLocations.canonical_municipality(value)
        when :neighborhood
          AngolaLocations.canonical_neighborhood(value)
        end
      end

      def public_search_payload(professional)
        payload = Api::V1::ProfessionalSerializer.call(
          professional,
          detail: true,
          include_contact: false,
          include_coordinates: false
        )

        distance = distance_from_params(professional)
        payload[:distance_km] = distance.round(1) if distance
        payload
      end

      def apply_radius(results)
        radius = params[:radius_km].presence&.to_f
        return results unless radius&.positive? && coordinates_from_params?

        results.select { |result| result[:distance_km].present? && result[:distance_km] <= radius }
      end

      def sort_results(results)
        return results.sort_by { |result| [ result[:distance_km] || Float::INFINITY, -result[:rating].to_f ] } if coordinates_from_params?

        results.sort_by { |result| [ -result[:rating].to_f, -result[:completed_jobs].to_i ] }
      end

      def distance_from_params(professional)
        return nil unless coordinates_from_params?
        return nil if professional.latitude.blank? || professional.longitude.blank?

        distance_between(
          params[:latitude].to_f,
          params[:longitude].to_f,
          professional.latitude.to_f,
          professional.longitude.to_f
        )
      end

      def coordinates_from_params?
        params[:latitude].present? && params[:longitude].present?
      end

      def distance_between(origin_latitude, origin_longitude, target_latitude, target_longitude)
        earth_radius_km = 6371.0
        lat1 = radians(origin_latitude)
        lat2 = radians(target_latitude)
        delta_lat = radians(target_latitude - origin_latitude)
        delta_lon = radians(target_longitude - origin_longitude)

        a = Math.sin(delta_lat / 2)**2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(delta_lon / 2)**2

        earth_radius_km * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
      end

      def radians(value)
        value * Math::PI / 180
      end

      def lower(attribute)
        Arel::Nodes::NamedFunction.new("LOWER", [ attribute ])
      end
    end
  end
end
