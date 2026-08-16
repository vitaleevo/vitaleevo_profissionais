module ApplicationHelper
  def money_aoa(cents)
    amount = cents.to_i / 100.0
    number_to_currency(amount, unit: "Kz ", separator: ",", delimiter: ".", precision: 0)
  end

  def status_label(status)
    {
      "pending" => "Pendente",
      "assigned" => "Atribuido",
      "accepted" => "Aceite",
      "in_progress" => "Em execucao",
      "completed" => "Concluido",
      "cancelled" => "Cancelado",
      "disputed" => "Em disputa",
      "normal" => "Normal",
      "urgent" => "Urgente",
      "priority" => "Prioritario",
      "online" => "Online",
      "offline" => "Offline",
      "occupied" => "Ocupado",
      "suspended" => "Suspenso",
      "verified" => "Verificado",
      "pending_docs" => "Documentos pendentes"
    }.fetch(status, status.to_s.humanize)
  end

  def status_class(status)
    {
      "pending" => "badge badge-warning",
      "assigned" => "badge badge-info",
      "accepted" => "badge badge-info",
      "in_progress" => "badge badge-primary",
      "completed" => "badge badge-success",
      "cancelled" => "badge badge-danger",
      "disputed" => "badge badge-danger",
      "online" => "badge badge-success",
      "offline" => "badge",
      "occupied" => "badge badge-warning",
      "suspended" => "badge badge-danger",
      "verified" => "badge badge-success"
    }.fetch(status, "badge")
  end

  def category_icon(category, class_name: nil)
    tag.span(category_icon_token(category), class: icon_classes("category-icon", class_name), aria: { hidden: true })
  end

  def category_image(category)
    {
      "manutencao-eletrica" => "market-electrician.jpg",
      "canalizacao" => "market-plumbing.jpg",
      "limpeza-tecnica" => "market-hero-service.jpg",
      "consultoria-juridica" => "market-consulting.jpg"
    }.fetch(category.slug, "market-hero-service.jpg")
  end

  def ui_icon(name, class_name: nil)
    tag.span(icon_token(name), class: icon_classes(class_name), aria: { hidden: true })
  end

  def category_icon_token(category)
    {
      "manutencao-eletrica" => "EL",
      "canalizacao" => "CA",
      "saude-ao-domicilio" => "SA",
      "ti-redes" => "TI",
      "limpeza-tecnica" => "LI",
      "consultoria-juridica" => "JU"
    }.fetch(category.slug, initials_for(category.name))
  end

  def icon_token(name)
    {
      "account_balance_wallet" => "KZ",
      "add_task" => "+",
      "assignment" => "OS",
      "assignment_turned_in" => "OK",
      "badge" => "BI",
      "category" => "CT",
      "dashboard" => "DB",
      "engineering" => "PR",
      "event" => "7D",
      "logout" => "SA",
      "notifications" => "NT",
      "payments" => "KZ",
      "percent" => "%",
      "receipt_long" => "EX",
      "schedule" => "TM",
      "search" => "SC",
      "shield" => "SG",
      "shopping_cart" => "PD",
      "star" => "AV",
      "support_agent" => "AJ",
      "task_alt" => "OK",
      "verified" => "OK",
      "verified_user" => "OK",
      "work" => "SV",
      "workspace_premium" => "TOP"
    }.fetch(name.to_s, initials_for(name))
  end

  def initials_for(text)
    parts = text.to_s.gsub(/[_-]/, " ").split
    initials = parts.map { |part| part[0] }.join.first(3)
    initials.presence&.upcase || "CM"
  end

  def icon_classes(*classes)
    ([ "ui-icon" ] + classes.flatten.compact).join(" ")
  end
end
