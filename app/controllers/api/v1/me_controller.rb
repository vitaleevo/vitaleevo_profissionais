module Api
  module V1
    class MeController < BaseController
      def show
        render json: {
          data: Api::V1::UserSerializer.call(current_user)
        }
      end
    end
  end
end
