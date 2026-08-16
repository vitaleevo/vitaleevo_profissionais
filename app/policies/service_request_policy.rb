class ServiceRequestPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    operational? || client_owner? || eligible_assigned_professional?
  end

  def create?
    operational? || user&.client?
  end

  def assign?
    operational?
  end

  def update_status?
    operational? || eligible_assigned_professional?
  end

  def complete?
    operational?
  end

  def review?
    client_owner? && record.status == "completed" && record.professional_id.present? && record.review.blank?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user
      return scope.all if user.operational?
      return scope.where(professional_id: user.professional.id) if eligible_professional?
      return scope.where(client_id: user.client.id) if user.client? && user.client

      scope.none
    end

    private

    def eligible_professional?
      user.professional? && user.professional&.publicly_listed?
    end
  end

  private

  def client_owner?
    user&.client? && user.client && record.client_id == user.client.id
  end

  def eligible_assigned_professional?
    user&.professional? &&
      user.professional&.publicly_listed? &&
      record.professional_id == user.professional.id
  end
end
