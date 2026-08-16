module ServiceRequests
  class Assign
    def initialize(service_request:, professional:, actor: nil)
      @service_request = service_request
      @professional = professional
      @actor = actor
    end

    def call
      validate_professional_assignment!

      ActiveRecord::Base.transaction do
        previous_professional_id = service_request.professional_id
        previous_status = service_request.status
        service_request.assign_to!(professional)
        record_assignment!(previous_professional_id, previous_status)
        notify_professional
      end

      service_request
    end

    private

    attr_reader :service_request, :professional, :actor

    def validate_professional_assignment!
      return if professional.assignable_to?(service_request)

      professional.errors.add(:base, "Profissional precisa estar verificado, ativo e habilitado para a categoria do pedido.")
      raise ActiveRecord::RecordInvalid, professional
    end

    def notify_professional
      Notification.create!(
        recipient_name: professional.name,
        channel: "sms",
        event: "assignment",
        title: "Nova ordem de servico",
        body: "Pedido #{service_request.code} atribuido para #{professional.specialty}."
      )
    end

    def record_assignment!(previous_professional_id, previous_status)
      AuditLog.record!(
        action: "service_request.assigned",
        actor: actor,
        auditable: service_request,
        metadata: {
          professional_id: professional.id,
          previous_professional_id: previous_professional_id,
          previous_status: previous_status,
          next_status: service_request.status
        }
      )
    end
  end
end
