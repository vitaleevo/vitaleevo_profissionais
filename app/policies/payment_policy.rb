class PaymentPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user
      return scope.all if user.operational?

      service_requests = Pundit.policy_scope!(user, ServiceRequest)
      scope.where(service_request_id: service_requests.select(:id))
    end
  end
end
