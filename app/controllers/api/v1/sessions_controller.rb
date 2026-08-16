module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_user!, only: %i[create csrf]

      def csrf
        render json: {
          data: {
            csrf_token: form_authenticity_token
          }
        }
      end

      def create
        user = User.find_by(email: params.require(:email).to_s.downcase)

        if user&.valid_password?(params.require(:password)) && user.active_for_authentication?
          reset_session
          sign_in(user)
          StructuredEventLog.info(
            "auth.login_succeeded",
            actor_id: user.id,
            actor_role: user.role,
            method: request.request_method,
            path: request.path
          )
          render json: {
            data: Api::V1::UserSerializer.call(user)
          }
        else
          StructuredEventLog.info(
            "auth.login_failed",
            method: request.request_method,
            path: request.path
          )
          render_error("invalid_credentials", "Email ou senha invalidos.", :unauthorized)
        end
      end

      def destroy
        actor = current_user
        sign_out(current_user)
        reset_session
        request.session_options[:drop] = true
        expire_session_cookie!
        StructuredEventLog.info(
          "auth.logout_succeeded",
          actor_id: actor&.id,
          actor_role: actor&.role,
          method: request.request_method,
          path: request.path
        )

        render json: {
          data: {
            signed_out: true
          }
        }
      end

      private

      def expire_session_cookie!
        session_options = Rails.application.config.session_options
        cookie_options = { path: session_options[:path] || "/" }
        cookie_options[:domain] = session_options[:domain] if session_options[:domain].present?
        cookie_options[:same_site] = session_options[:same_site] if session_options.key?(:same_site)
        cookie_options[:secure] = session_options[:secure] unless session_options[:secure].nil?

        cookies.delete(session_options.fetch(:key), cookie_options)
      end
    end
  end
end
