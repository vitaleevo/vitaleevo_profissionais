module Api
  module V1
    class ClientSerializer
      def self.call(client, include_private: true, include_identity: true)
        data = {
          id: client.id,
          province: attribute_for(client, :province),
          municipality: attribute_for(client, :municipality),
          neighborhood: client.neighborhood
        }

        if include_identity
          data[:name] = client.name
          data[:company_name] = client.company_name
        end

        if include_private
          data[:contact] = {
            phone: client.phone,
            email: client.email
          }
          data[:address] = client.address
          data[:coordinates] = {
            latitude: client.latitude,
            longitude: client.longitude
          }
        end

        data
      end

      def self.attribute_for(record, name)
        return nil unless record.has_attribute?(name)

        record.public_send(name)
      end
      private_class_method :attribute_for
    end
  end
end
