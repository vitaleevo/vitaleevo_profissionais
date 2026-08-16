AuditLog.destroy_all
Notification.destroy_all
Review.destroy_all
Payment.destroy_all
ServiceRequest.destroy_all
ProfessionalService.destroy_all
Professional.destroy_all
Client.destroy_all
User.destroy_all
ServiceCategory.destroy_all

categories = [
  {
    name: "Formacao Comercial & Vendas",
    slug: "formacao-corporativa-vendas",
    description: "Tecnicas de vendas, atendimento de alto impacto, negociacao estrategica, CRM e fecho comercial.",
    base_price_cents: 500_000_00,
    average_duration_minutes: 240,
    urgent_available: true
  },
  {
    name: "Marketing Digital & Trafego",
    slug: "formacao-marketing-digital",
    description: "Gestao profissional de redes sociais, campanhas Meta Ads, Google Ads e geracao de leads para empresas.",
    base_price_cents: 450_000_00,
    average_duration_minutes: 180,
    urgent_available: true
  },
  {
    name: "Design Grafico & Branding",
    slug: "design-grafico-branding",
    description: "Criacao de identidade visual, Canva, Photoshop, Illustrator e materiais promocionais corporativos.",
    base_price_cents: 350_000_00,
    average_duration_minutes: 180,
    urgent_available: true
  },
  {
    name: "Excel Avancado & Power BI",
    slug: "excel-power-bi-m365",
    description: "Modelagem de dados, dashboards gerenciais no Power BI, funcoes avancadas de Excel e Microsoft 365.",
    base_price_cents: 400_000_00,
    average_duration_minutes: 180,
    urgent_available: true
  },
  {
    name: "Lideranca & Gestao de KPIs",
    slug: "lideranca-gestao-kpis",
    description: "Desenvolvimento de lideres, gestao de equipas de alto rendimento, definicao de KPIs e planeamento.",
    base_price_cents: 600_000_00,
    average_duration_minutes: 240,
    urgent_available: true
  },
  {
    name: "Academia Vitaleevo",
    slug: "academia-vitaleevo",
    description: "Formacao intensiva de 30, 60 e 90 dias para jovens licenciados e criacao de talentos corporativos.",
    base_price_cents: 250_000_00,
    average_duration_minutes: 360,
    urgent_available: false
  },
  {
    name: "Outsourcing Forca de Vendas",
    slug: "outsourcing-forca-vendas",
    description: "Alocacao de equipas de vendas com supervisao Vitaleevo (Pacote Sales Team e Promotores).",
    base_price_cents: 3_000_000_00,
    average_duration_minutes: 480,
    urgent_available: true
  },
  {
    name: "Outsourcing Marketing & Design",
    slug: "outsourcing-marketing-design",
    description: "Pacote Marketing Team com 1 Designer + 1 Gestor de Redes Sociais com supervisao estrategica.",
    base_price_cents: 800_000_00,
    average_duration_minutes: 480,
    urgent_available: true
  },
  {
    name: "Limpeza Corporativa & Pos-Obra",
    slug: "limpeza-corporativa",
    description: "Higienizacao de escritorios, clinicas, escolas, bancos, condominios e equipas permanentes.",
    base_price_cents: 350_000_00,
    average_duration_minutes: 360,
    urgent_available: true
  },
  {
    name: "Auditoria & Diagnostico 360",
    slug: "consultoria-diagnostico-360",
    description: "Diagnostico profundo de vendas, produtividade, tecnologia e processos com plano de acao imediato.",
    base_price_cents: 1_200_000_00,
    average_duration_minutes: 300,
    urgent_available: true
  },
  {
    name: "TI e redes",
    slug: "ti-redes",
    description: "Configuracao de redes, suporte a computadores, infraestrutura, cameras IP e ciberseguranca.",
    base_price_cents: 40_000_00,
    average_duration_minutes: 100,
    urgent_available: true
  },
  {
    name: "Manutencao eletrica",
    slug: "manutencao-eletrica",
    description: "Reparos residenciais e empresariais, quadros, geradores e manutencao preventiva.",
    base_price_cents: 35_000_00,
    average_duration_minutes: 90,
    urgent_available: true
  },
  {
    name: "Canalizacao",
    slug: "canalizacao",
    description: "Fugas, instalacoes hidraulicas, bombas de agua e manutencao preventiva.",
    base_price_cents: 30_000_00,
    average_duration_minutes: 120,
    urgent_available: true
  },
  {
    name: "Saude ao domicilio",
    slug: "saude-ao-domicilio",
    description: "Enfermagem, cuidados programados, medicina ocupacional e apoio familiar.",
    base_price_cents: 45_000_00,
    average_duration_minutes: 60,
    urgent_available: true
  },
  {
    name: "Consultoria juridica",
    slug: "consultoria-juridica",
    description: "Contratos de trabalho, compliance empresarial, pareceres e apoio regulatorio.",
    base_price_cents: 55_000_00,
    average_duration_minutes: 60,
    urgent_available: true
  }
].index_by { |attrs| attrs[:slug] }

categories.each_value { |attrs| ServiceCategory.create!(attrs) }

professionals = [
  {
    name: "Joaquim Mateus",
    phone: "+244 923 101 001",
    email: "joaquim@conectaangola.ao",
    specialty: "Consultor Comercial & Supervisor de Vendas",
    bio: "Especialista Vitaleevo com mais de 9 anos de experiencia em estruturacao de forca de vendas, implantacao de CRM e treino de alta conversao em Luanda.",
    location: "Talatona, Luanda",
    province: "Luanda",
    municipality: "Talatona",
    neighborhood: "Talatona",
    status: "online",
    documents_status: "verified",
    operator_notes: "Consultor lider de vendas e formacao comercial da Vitaleevo.",
    experience_years: 9,
    hourly_rate_cents: 35_000_00,
    rating: 4.95,
    quality_rating: 5.0,
    punctuality_rating: 4.9,
    communication_rating: 4.9,
    completed_jobs: 142,
    response_minutes: 10,
    latitude: -8.9166,
    longitude: 13.1829,
    categories: %w[formacao-corporativa-vendas outsourcing-forca-vendas consultoria-diagnostico-360]
  },
  {
    name: "Marta Simoes",
    phone: "+244 923 101 002",
    email: "marta@conectaangola.ao",
    specialty: "Gestora de RH & Saude Ocupacional",
    bio: "Experiencia em diagnostico de clima organizacional, gestao de talentos e formacao em lideranca corporativa.",
    location: "Maianga, Luanda",
    province: "Luanda",
    municipality: "Maianga",
    neighborhood: "Maianga",
    status: "online",
    documents_status: "verified",
    experience_years: 8,
    hourly_rate_cents: 30_000_00,
    rating: 4.92,
    quality_rating: 5.0,
    punctuality_rating: 4.8,
    communication_rating: 5.0,
    completed_jobs: 104,
    response_minutes: 15,
    latitude: -8.8273,
    longitude: 13.2450,
    categories: %w[lideranca-gestao-kpis academia-vitaleevo saude-ao-domicilio]
  },
  {
    name: "Helena Costa",
    phone: "+244 923 101 004",
    email: "helena@conectaangola.ao",
    specialty: "Especialista em Power BI & Excel Avancado",
    bio: "Formadora corporativa focada em dashboards executivos, KPIs automatizados, modelagem de dados no Microsoft 365 e infraestrutura de TI.",
    location: "Viana, Luanda",
    province: "Luanda",
    municipality: "Viana",
    neighborhood: "Viana",
    status: "online",
    documents_status: "verified",
    experience_years: 7,
    hourly_rate_cents: 32_000_00,
    rating: 4.88,
    quality_rating: 4.9,
    punctuality_rating: 4.8,
    communication_rating: 4.9,
    completed_jobs: 92,
    response_minutes: 12,
    latitude: -8.9040,
    longitude: 13.3718,
    categories: %w[excel-power-bi-m365 ti-redes]
  },
  {
    name: "Pedro Elias",
    phone: "+244 923 101 005",
    email: "pedro@conectaangola.ao",
    specialty: "Coordenador de Limpeza Corporativa & Facilities",
    bio: "Responsavel pela alocacao e gestao de equipas permanentes para escritorios, clinicas, condominios e higienizacao pos-obra.",
    location: "Benfica, Luanda",
    province: "Luanda",
    municipality: "Talatona",
    neighborhood: "Benfica",
    status: "online",
    documents_status: "verified",
    experience_years: 6,
    hourly_rate_cents: 25_000_00,
    rating: 4.78,
    quality_rating: 4.8,
    punctuality_rating: 4.7,
    communication_rating: 4.8,
    completed_jobs: 88,
    response_minutes: 20,
    latitude: -8.9741,
    longitude: 13.1908,
    categories: %w[limpeza-corporativa]
  },
  {
    name: "Adriana Paulo",
    phone: "+244 923 101 006",
    email: "adriana@conectaangola.ao",
    specialty: "Advogada & Consultora de Compliance",
    bio: "Auditoria de contratos de trabalho, retencao de talentos, regulacao laboral em Angola e estruturacao de politicas corporativas.",
    location: "Ingombota, Luanda",
    province: "Luanda",
    municipality: "Ingombota",
    neighborhood: "Ingombota",
    status: "online",
    documents_status: "verified",
    experience_years: 9,
    hourly_rate_cents: 40_000_00,
    rating: 4.93,
    quality_rating: 5.0,
    punctuality_rating: 4.9,
    communication_rating: 4.9,
    completed_jobs: 97,
    response_minutes: 18,
    latitude: -8.8147,
    longitude: 13.2302,
    categories: %w[consultoria-juridica consultoria-diagnostico-360]
  },
  {
    name: "Manuel Kaluanda",
    phone: "+244 923 101 015",
    email: "manuel.kaluanda@conectaangola.ao",
    specialty: "Gestor de Trafego & Meta/Google Ads",
    bio: "Gestao de campanhas pagas de alta escala para concessionarias, imobiliarias e distribuicao no mercado angolano.",
    location: "Alvalade, Luanda",
    province: "Luanda",
    municipality: "Maianga",
    neighborhood: "Alvalade",
    status: "online",
    documents_status: "verified",
    experience_years: 6,
    hourly_rate_cents: 28_000_00,
    rating: 4.89,
    quality_rating: 4.9,
    punctuality_rating: 4.8,
    communication_rating: 4.9,
    completed_jobs: 65,
    response_minutes: 14,
    latitude: -8.8350,
    longitude: 13.2420,
    categories: %w[formacao-marketing-digital outsourcing-marketing-design]
  },
  {
    name: "Carla Ndala",
    phone: "+244 923 101 016",
    email: "carla.ndala@conectaangola.ao",
    specialty: "Designer Grafico Senior & Branding",
    bio: "Criacao de identidade visual completa, catalogos corporativos, apresentacoes executivas e design para redes sociais.",
    location: "Miramar, Luanda",
    province: "Luanda",
    municipality: "Sambizanga",
    neighborhood: "Miramar",
    status: "online",
    documents_status: "verified",
    experience_years: 7,
    hourly_rate_cents: 26_000_00,
    rating: 4.91,
    quality_rating: 5.0,
    punctuality_rating: 4.8,
    communication_rating: 4.9,
    completed_jobs: 74,
    response_minutes: 16,
    latitude: -8.8080,
    longitude: 13.2460,
    categories: %w[design-grafico-branding outsourcing-marketing-design]
  },
  {
    name: "Samuel Bumba",
    phone: "+244 923 101 010",
    email: "samuel@conectaangola.ao",
    specialty: "Consultor de CRM & Automacao",
    bio: "Implantacao de softwares de CRM, integracao de funis de vendas, WhatsApp corporativo e apoio tecnologico a PMEs.",
    location: "Cabinda, Cabinda",
    province: "Cabinda",
    municipality: "Cabinda",
    neighborhood: "Chibodo",
    status: "online",
    documents_status: "verified",
    experience_years: 7,
    hourly_rate_cents: 30_000_00,
    rating: 4.82,
    quality_rating: 4.8,
    punctuality_rating: 4.8,
    communication_rating: 4.9,
    completed_jobs: 79,
    response_minutes: 22,
    latitude: -5.5500,
    longitude: 12.2000,
    categories: %w[formacao-corporativa-vendas ti-redes consultoria-diagnostico-360]
  },
  {
    name: "Carlos Vunge",
    phone: "+244 923 101 003",
    email: "carlos@conectaangola.ao",
    specialty: "Tecnico Senior de Facilities",
    bio: "Supervisao de redes hidraulicas e manutencao preventiva para edificios corporativos.",
    location: "Kilamba, Luanda",
    province: "Luanda",
    municipality: "Kilamba",
    neighborhood: "Kilamba",
    status: "occupied",
    documents_status: "verified",
    experience_years: 11,
    hourly_rate_cents: 18_500_00,
    rating: 4.70,
    quality_rating: 4.7,
    punctuality_rating: 4.6,
    communication_rating: 4.8,
    completed_jobs: 154,
    response_minutes: 28,
    latitude: -8.9957,
    longitude: 13.2644,
    categories: %w[canalizacao manutencao-eletrica]
  }
]

professionals.each do |attrs|
  slugs = attrs.delete(:categories)
  professional = Professional.create!(attrs)
  professional.service_categories = slugs.map { |slug| ServiceCategory.find_by!(slug: slug) }
end

clients = [
  {
    name: "Ana Manuel",
    phone: "+244 934 200 100",
    email: "ana.manuel@example.com",
    address: "Condominio Atlantico, Talatona",
    province: "Luanda",
    municipality: "Talatona",
    neighborhood: "Talatona",
    latitude: -8.9182,
    longitude: 13.1850
  },
  {
    name: "Kiala Comercio & Distribuicao",
    phone: "+244 934 200 200",
    email: "operacoes@kiala.co.ao",
    company_name: "Kiala Comercio & Distribuicao",
    address: "Rua Major Kanhangulo, Ingombota",
    province: "Luanda",
    municipality: "Ingombota",
    neighborhood: "Ingombota",
    latitude: -8.8140,
    longitude: 13.2314
  },
  {
    name: "Clinica Luanda Care",
    phone: "+244 934 200 400",
    email: "direcao@luandacare.co.ao",
    company_name: "Clinica Luanda Care",
    address: "Avenida 21 de Janeiro, Morro Bento",
    province: "Luanda",
    municipality: "Talatona",
    neighborhood: "Morro Bento",
    latitude: -8.8850,
    longitude: 13.2010
  },
  {
    name: "AutoAngola Concessionaria",
    phone: "+244 934 200 500",
    email: "vendas@autoangola.co.ao",
    company_name: "AutoAngola Concessionaria",
    address: "Estrada de Catete, Viana",
    province: "Luanda",
    municipality: "Viana",
    neighborhood: "Viana",
    latitude: -8.9010,
    longitude: 13.3650
  }
].map { |attrs| Client.create!(attrs) }

demo_password = "Conecta123!"

admin_user = User.create!(
  name: "Administrador Vitaleevo",
  email: "admin@conectaangola.ao",
  password: demo_password,
  password_confirmation: demo_password,
  role: "admin"
)

admin_vhc = User.create!(
  name: "Direção Geral Vitaleevo",
  email: "admin@vitaleevo.ao",
  password: demo_password,
  password_confirmation: demo_password,
  role: "admin"
)

operator_user = User.create!(
  name: "Operador Luanda Vitaleevo",
  email: "operador@conectaangola.ao",
  password: demo_password,
  password_confirmation: demo_password,
  role: "operator"
)

Professional.find_each do |professional|
  user = User.create!(
    name: professional.name,
    email: professional.email,
    password: demo_password,
    password_confirmation: demo_password,
    role: "professional"
  )
  professional.update!(user: user)
end

clients.each do |client|
  next if client.email.blank?

  user = User.create!(
    name: client.name,
    email: client.email,
    password: demo_password,
    password_confirmation: demo_password,
    role: "client"
  )
  client.update!(user: user)
end

sales_lead = Professional.find_by!(name: "Joaquim Mateus")
bi_expert = Professional.find_by!(name: "Helena Costa")
cleaning_lead = Professional.find_by!(name: "Pedro Elias")
compliance_expert = Professional.find_by!(name: "Adriana Paulo")

requests = [
  ServiceRequest.create!(
    client: clients[3], # AutoAngola
    service_category: ServiceCategory.find_by!(slug: "formacao-corporativa-vendas"),
    professional: sales_lead,
    title: "Pacote Comercial 360 - Treino de 12 Vendedores e Implantacao de CRM",
    description: "Auditoria comercial completa, treino intensivo de tecnicas de fecho, implantacao de CRM de vendas e definicao de metas com KPIs para a equipa da concessionaria.",
    location: clients[3].address,
    province: clients[3].province,
    municipality: clients[3].municipality,
    neighborhood: clients[3].neighborhood,
    latitude: clients[3].latitude,
    longitude: clients[3].longitude,
    urgency: "urgent",
    status: "assigned",
    budget_cents: 4_500_000_00,
    scheduled_at: 1.day.from_now
  ),
  ServiceRequest.create!(
    client: clients[1], # Kiala
    service_category: ServiceCategory.find_by!(slug: "consultoria-juridica"),
    professional: compliance_expert,
    title: "Auditoria e Revisao de Contratos de Outsourcing",
    description: "Revisao integral de termos de prestacao de servico, politicas laborais e conformidade regulatoria.",
    location: clients[1].address,
    province: clients[1].province,
    municipality: clients[1].municipality,
    neighborhood: clients[1].neighborhood,
    latitude: clients[1].latitude,
    longitude: clients[1].longitude,
    urgency: "normal",
    status: "completed",
    budget_cents: 850_000_00,
    scheduled_at: 1.day.ago,
    completed_at: 4.hours.ago
  ),
  ServiceRequest.create!(
    client: clients[2], # Clinica Luanda Care
    service_category: ServiceCategory.find_by!(slug: "limpeza-corporativa"),
    professional: cleaning_lead,
    title: "Equipa Permanente de Limpeza Hospitalar (4 Operadoras)",
    description: "Alocacao mensal de equipa treinada com produtos certificados de desinfeccao e supervisao quinzenal Vitaleevo.",
    location: clients[2].address,
    province: clients[2].province,
    municipality: clients[2].municipality,
    neighborhood: clients[2].neighborhood,
    latitude: clients[2].latitude,
    longitude: clients[2].longitude,
    urgency: "priority",
    status: "accepted",
    budget_cents: 1_800_000_00,
    scheduled_at: 2.days.from_now.change(hour: 8)
  ),
  ServiceRequest.create!(
    client: clients[0], # Ana Manuel
    service_category: ServiceCategory.find_by!(slug: "excel-power-bi-m365"),
    professional: bi_expert,
    title: "Formacao Executiva em Power BI e Dashboards Financeiros",
    description: "Capacitacao executiva individual para criacao de relatorios automatizados e analise de demonstracoes de resultados.",
    location: clients[0].address,
    neighborhood: clients[0].neighborhood,
    latitude: clients[0].latitude,
    longitude: clients[0].longitude,
    urgency: "normal",
    status: "pending",
    budget_cents: 400_000_00,
    scheduled_at: 3.days.from_now.change(hour: 10)
  )
]

completed_request = requests.second
completed_request.payments.create!(
  amount_cents: completed_request.budget_cents,
  status: "paid",
  method: "multicaixa_express",
  paid_at: 3.hours.ago
)

Review.create!(
  service_request: completed_request,
  professional: compliance_expert,
  client: clients[1],
  quality: 5,
  punctuality: 5,
  communication: 5,
  comment: "Excelente trabalho da equipa Vitaleevo. Auditoria precisa e contrato entregue rigorosamente no prazo."
)

AuditLog.record!(
  action: "service_request.assigned",
  actor: admin_user,
  auditable: requests.first,
  metadata: {
    professional_id: sales_lead.id,
    previous_professional_id: nil,
    previous_status: "pending",
    next_status: "assigned"
  }
)

Notification.create!(
  recipient_name: "Operacao Vitaleevo",
  channel: "email",
  event: "daily_summary",
  title: "Resumo Operacional Vitaleevo",
  body: "Base corporativa Vitaleevo inicializada com sucesso: formacao, outsourcing, academia e limpeza corporativa."
)
