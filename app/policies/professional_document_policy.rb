class ProfessionalDocumentPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    operational? || owned_by_user?
  end

  def create?
    user&.professional? && owned_by_user?
  end

  def review?
    operational?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user
      return scope.all if user.operational?
      return scope.joins(:professional).where(professionals: { user_id: user.id }) if user.professional?

      scope.none
    end
  end

  private

  def owned_by_user?
    record.professional&.user_id == user&.id
  end
end
