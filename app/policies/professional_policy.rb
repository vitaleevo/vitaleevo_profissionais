class ProfessionalPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    operational? || record.user_id == user.id || (user&.client? && record.publicly_listed?)
  end

  def create?
    operational? || (user&.professional? && record.user_id == user.id)
  end

  def update?
    operational? || record.user_id == user.id
  end

  def update_operations?
    operational?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user
      return scope.all if user.operational?
      return scope.where(user_id: user.id) if user.professional?

      scope.publicly_listed
    end
  end
end
