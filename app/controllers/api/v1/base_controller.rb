module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
      rescue_from ActionController::ParameterMissing, with: :render_bad_request
      rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

      private

      def authenticate_user!
        return if user_signed_in?

        render_error("unauthorized", "Autenticacao obrigatoria.", :unauthorized)
      end

      def render_not_found(_error)
        render_error("not_found", "Recurso nao encontrado.", :not_found)
      end

      def render_bad_request(_error)
        render_error("bad_request", "Pedido invalido.", :bad_request)
      end

      def render_forbidden
        render_error("forbidden", "Voce nao tem permissao para acessar este recurso.", :forbidden)
      end

      def render_unprocessable_entity(error)
        render json: {
          error: {
            code: "validation_failed",
            message: "Os dados enviados nao sao validos.",
            details: error.record.errors.to_hash(true)
          }
        }, status: :unprocessable_entity
      end

      def render_error(code, message, status)
        log_api_error(code, status)

        render json: {
          error: {
            code: code,
            message: message
          }
        }, status: status
      end

      def log_api_error(code, status)
        StructuredEventLog.info(
          "api.error",
          error_code: code,
          http_status: http_status_code(status),
          method: request.request_method,
          path: request.path,
          controller: self.class.name,
          action: action_name
        )
      end

      def http_status_code(status)
        return 422 if status == :unprocessable_entity

        Rack::Utils.status_code(status)
      end
    end
  end
end
