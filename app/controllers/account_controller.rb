class AccountController < ApplicationController
  def show
    @client = current_user.client
    @professional = current_user.professional
    @service_requests = policy_scope(ServiceRequest).recent.limit(5)
  end
end
