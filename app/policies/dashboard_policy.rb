class DashboardPolicy < ApplicationPolicy
  def index?
    operational?
  end
end
