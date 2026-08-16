module Api
  module V1
    class HealthController < BaseController
      skip_before_action :authenticate_user!

      def show
        render json: {
          data: {
            status: "ok",
            checks: {
              database: database_status
            },
            checked_at: Time.current.iso8601
          }
        }
      rescue StandardError
        render json: {
          data: {
            status: "degraded",
            checks: {
              database: "error"
            },
            checked_at: Time.current.iso8601
          },
          error: {
            code: "health_check_failed",
            message: "A verificacao de saude falhou."
          }
        }, status: :service_unavailable
      end

      private

      def database_status
        ActiveRecord::Base.connection_pool.with_connection do |connection|
          connection.select_value("SELECT 1").to_i == 1 ? "ok" : "error"
        end
      end
    end
  end
end
