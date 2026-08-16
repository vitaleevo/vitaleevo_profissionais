module Api
  module V1
    class ReviewsController < BaseController
      def create
        service_request = policy_scope(ServiceRequest)
          .includes(:client, :professional, :review)
          .find(params[:service_request_id] || params[:id])
        authorize service_request, :review?

        review = service_request.build_review(review_params.merge(
          client: service_request.client,
          professional: service_request.professional
        ))

        ActiveRecord::Base.transaction do
          review.save!
        end

        render json: {
          data: Api::V1::ReviewSerializer.call(review.reload)
        }, status: :created
      end

      private

      def review_params
        params.require(:review).permit(:quality, :punctuality, :communication, :comment)
      end
    end
  end
end
