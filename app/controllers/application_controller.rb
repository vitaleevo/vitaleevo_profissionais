class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  around_action :with_current_context
  before_action :authenticate_user!, unless: :devise_controller?
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :name ])
  end

  private

  def after_sign_in_path_for(resource)
    return dashboard_path if resource.operational?
    return professional_dashboard_path if resource.professional?

    my_service_requests_path
  end

  def user_not_authorized
    respond_to do |format|
      format.html { redirect_to root_path, alert: "Voce nao tem permissao para acessar esta area." }
      format.json { render json: { error: "forbidden" }, status: :forbidden }
    end
  end

  def with_current_context
    Current.request_id = request.request_id
    Current.user = current_user if user_signed_in?

    yield
  ensure
    Current.reset
  end
end
