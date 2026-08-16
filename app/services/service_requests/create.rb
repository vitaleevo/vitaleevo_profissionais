module ServiceRequests
  class Create
    def initialize(user:, client_attributes:, request_attributes:, budget_cents:, attachments: [])
      @user = user
      @client_attributes = client_attributes
      @request_attributes = request_attributes
      @budget_cents = budget_cents
      @attachments = attachments
    end

    def call
      client = find_or_build_client
      service_request = client.service_requests.new(request_attributes)
      service_request.budget_cents = budget_cents

      ActiveRecord::Base.transaction do
        client.save!
        service_request.save!
        attach_files(service_request)
        notify_operation(client, service_request)
      end

      service_request
    end

    private

    attr_reader :user, :client_attributes, :request_attributes, :budget_cents, :attachments

    def find_or_build_client
      if user.client?
        client = user.client || user.build_client
        client.assign_attributes(normalized_client_attributes.merge(email: user.email))
        return client
      end

      client = Client.find_or_initialize_by(phone: normalized_client_attributes[:phone])
      client.assign_attributes(normalized_client_attributes)
      client
    end

    def request_attributes
      AngolaLocations.normalize_params(@request_attributes)
    end

    def normalized_client_attributes
      @normalized_client_attributes ||= AngolaLocations.normalize_params(client_attributes)
    end

    def notify_operation(client, service_request)
      Notification.create!(
        recipient_name: "Operacao",
        channel: "email",
        event: "new_request",
        title: "Novo pedido #{service_request.code}",
        body: "#{client.name} solicitou #{service_request.service_category.name}."
      )
    end

    def attach_files(service_request)
      attachments.each do |uploaded_file|
        attachment = service_request.service_request_attachments.build(
          original_filename: uploaded_file.original_filename,
          content_type: UploadSafety.signature_content_type(uploaded_file),
          byte_size: uploaded_file.size
        )
        attachment.file.attach(uploaded_file)
        attachment.save!
      end
    end
  end
end
