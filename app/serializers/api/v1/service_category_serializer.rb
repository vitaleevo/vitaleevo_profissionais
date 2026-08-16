module Api
  module V1
    class ServiceCategorySerializer
      IMAGE_BY_SLUG = {
        "manutencao-eletrica" => "market-electrician.jpg",
        "canalizacao" => "market-plumbing.jpg",
        "limpeza-tecnica" => "market-hero-service.jpg",
        "consultoria-juridica" => "market-consulting.jpg"
      }.freeze

      ICON_BY_SLUG = {
        "manutencao-eletrica" => "EL",
        "canalizacao" => "CA",
        "saude-ao-domicilio" => "SA",
        "ti-redes" => "TI",
        "limpeza-tecnica" => "LI",
        "consultoria-juridica" => "JU"
      }.freeze

      def self.call(category, detail: false)
        image_name = IMAGE_BY_SLUG.fetch(category.slug, "market-hero-service.jpg")

        data = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          base_price_cents: category.base_price_cents,
          average_duration_minutes: category.average_duration_minutes,
          urgent_available: category.urgent_available,
          icon_token: ICON_BY_SLUG.fetch(category.slug, initials_for(category.name)),
          image_name: image_name,
          image_path: ActionController::Base.helpers.asset_path(image_name)
        }

        if detail && category.association(:professionals).loaded?
          data[:professionals_count] = category.professionals.count(&:publicly_listed?)
        end

        data
      end

      def self.initials_for(text)
        text.to_s.gsub(/[_-]/, " ").split.map { |part| part[0] }.join.first(3).presence&.upcase || "CM"
      end
      private_class_method :initials_for
    end
  end
end
