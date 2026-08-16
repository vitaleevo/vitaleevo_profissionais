module Api
  module V1
    class ServiceCategoriesController < BaseController
      skip_before_action :authenticate_user!

      def index
        categories = ServiceCategory.includes(:professionals).order(:name)

        render json: {
          data: categories.map { |category| Api::V1::ServiceCategorySerializer.call(category, detail: true) }
        }
      end

      def show
        category = ServiceCategory.includes(professionals: :service_categories).find_by!(slug: params[:slug])
        professionals = category.professionals.includes(:service_categories).publicly_listed.order(rating: :desc, completed_jobs: :desc)

        render json: {
          data: {
            category: Api::V1::ServiceCategorySerializer.call(category, detail: true),
            professionals: professionals.map { |professional| Api::V1::ProfessionalSerializer.call(professional, detail: true) }
          }
        }
      end
    end
  end
end
