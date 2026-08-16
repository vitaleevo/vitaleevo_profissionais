module Api
  module V1
    class UserSerializer
      def self.call(user)
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active?,
          profile: serialize_profile(user)
        }
      end

      def self.serialize_profile(user)
        return ClientSerializer.call(user.client) if user.client
        return ProfessionalSerializer.call(user.professional, detail: true, include_contact: true, include_coordinates: true) if user.professional

        nil
      end
      private_class_method :serialize_profile
    end
  end
end
