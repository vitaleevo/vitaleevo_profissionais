module Api
  module V1
    class MarketplaceController < BaseController
      skip_before_action :authenticate_user!

      def home
        categories = ServiceCategory.order(:name)
        popular_services = ServiceCategory.order(base_price_cents: :desc).limit(3)
        top_professionals = Professional.includes(:service_categories).publicly_listed.order(rating: :desc, completed_jobs: :desc).limit(3)

        render json: {
          data: {
            categories: categories.map { |category| Api::V1::ServiceCategorySerializer.call(category) },
            popular_services: popular_services.map { |category| Api::V1::ServiceCategorySerializer.call(category) },
            top_professionals: top_professionals.map { |professional| Api::V1::ProfessionalSerializer.call(professional) },
            stats: {
              categories_count: categories.count,
              featured_professionals_count: top_professionals.count,
              expected_average_rating: 4.9
            }
          }
        }
      end

      def trust
        reviews = Review.publicly_visible.includes(:client, :professional, :service_request).order(created_at: :desc).limit(6)
        professionals = Professional.includes(:service_categories).publicly_listed.order(rating: :desc).limit(4)

        render json: {
          data: {
            reviews: reviews.map { |review| Api::V1::ReviewSerializer.call(review, public_view: true) },
            professionals: professionals.map { |professional| Api::V1::ProfessionalSerializer.call(professional) },
            stats: {
              verified_professionals_count: Professional.publicly_listed.count,
              completed_requests_count: ServiceRequest.where(status: "completed").count,
              reviews_count: Review.publicly_visible.count
            }
          }
        }
      end
    end
  end
end
