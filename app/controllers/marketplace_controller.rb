class MarketplaceController < ApplicationController
  skip_before_action :authenticate_user!

  def home
    @categories = ServiceCategory.order(:name)
    @popular_services = ServiceCategory.order(base_price_cents: :desc).limit(3)
    @top_professionals = Professional.includes(:service_categories).publicly_listed.order(rating: :desc, completed_jobs: :desc).limit(3)
  end

  def categories
    @categories = ServiceCategory.includes(:professionals).order(:name)
  end

  def service
    @category = ServiceCategory.includes(:professionals).find_by!(slug: params[:slug])
    @professionals = @category.professionals.publicly_listed.order(rating: :desc, completed_jobs: :desc)
  end

  def how_it_works
  end

  def help
  end

  def trust
    @reviews = Review.publicly_visible.includes(:client, :professional, :service_request).order(created_at: :desc).limit(6)
    @professionals = Professional.publicly_listed.order(rating: :desc).limit(4)
  end
end
