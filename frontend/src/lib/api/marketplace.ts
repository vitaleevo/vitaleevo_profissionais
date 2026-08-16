import "server-only";

import { apiGet } from "./http";
import type { MarketplaceHome, Professional, Review, ServiceCategory } from "./types";

const defaultCategories: ServiceCategory[] = [
  {
    id: 1,
    name: "Formação em Vendas & CRM",
    slug: "vendas-crm",
    description: "Capacitação comercial e técnicas práticas de fecho.",
    base_price_cents: 50000000,
    average_duration_minutes: 240,
    urgent_available: true,
    icon_token: "book-open",
    image_name: "vendas-crm",
    image_path: "/images/services/vendas.webp",
    professionals_count: 12,
  },
  {
    id: 2,
    name: "Marketing Digital & Meta Ads",
    slug: "marketing-digital",
    description: "Gestão de tráfego e campanhas de conversão.",
    base_price_cents: 80000000,
    average_duration_minutes: 180,
    urgent_available: false,
    icon_token: "target",
    image_name: "marketing-digital",
    image_path: "/images/services/marketing.webp",
    professionals_count: 8,
  },
  {
    id: 3,
    name: "Excel Avançado & Power BI",
    slug: "excel-power-bi",
    description: "Dashboards gerenciais e inteligência de negócio.",
    base_price_cents: 60000000,
    average_duration_minutes: 360,
    urgent_available: true,
    icon_token: "zap",
    image_name: "excel-power-bi",
    image_path: "/images/services/powerbi.webp",
    professionals_count: 15,
  },
  {
    id: 4,
    name: "Outsourcing de Força de Vendas",
    slug: "outsourcing-vendas",
    description: "Equipas comerciais alocadas e supervisionadas.",
    base_price_cents: 300000000,
    average_duration_minutes: 480,
    urgent_available: true,
    icon_token: "users2",
    image_name: "outsourcing-vendas",
    image_path: "/images/services/outsourcing.webp",
    professionals_count: 6,
  },
  {
    id: 5,
    name: "Limpeza Corporativa & Facilities",
    slug: "limpeza-corporativa",
    description: "Higienização empresarial e equipas permanentes.",
    base_price_cents: 40000000,
    average_duration_minutes: 300,
    urgent_available: true,
    icon_token: "spray-can",
    image_name: "limpeza-corporativa",
    image_path: "/images/services/limpeza.webp",
    professionals_count: 10,
  },
  {
    id: 6,
    name: "Liderança & Gestão de KPIs",
    slug: "lideranca-gestao",
    description: "Desenvolvimento de executivos e supervisores.",
    base_price_cents: 75000000,
    average_duration_minutes: 240,
    urgent_available: false,
    icon_token: "graduation-cap",
    image_name: "lideranca-gestao",
    image_path: "/images/services/lideranca.webp",
    professionals_count: 5,
  },
];

const defaultProfessionals: Professional[] = [
  {
    id: 1,
    name: "Dr. Manuel Santos",
    specialty: "Consultor Comercial & Formador Sénior",
    bio: "Mais de 10 anos a formar equipas de alta performance em Angola.",
    location: "Luanda, Angola",
    province: "Luanda",
    municipality: "Luanda",
    status: "online",
    documents_status: "verified",
    experience_years: 12,
    hourly_rate_cents: 2500000,
    rating: 4.9,
    completed_jobs: 42,
    response_minutes: 15,
  },
  {
    id: 2,
    name: "Engª Ana Costa",
    specialty: "Especialista em Power BI & Processos",
    bio: "Consultora certificada em modelagem de dados e KPIs executivos.",
    location: "Luanda, Angola",
    province: "Luanda",
    municipality: "Talatona",
    status: "online",
    documents_status: "verified",
    experience_years: 9,
    hourly_rate_cents: 3000000,
    rating: 5.0,
    completed_jobs: 38,
    response_minutes: 10,
  },
  {
    id: 3,
    name: "Carlos Ferreira",
    specialty: "Gestor de Tráfego & Performance",
    bio: "Especialista em Meta Ads, aquisição B2B e geração de leads.",
    location: "Luanda, Angola",
    province: "Luanda",
    municipality: "Belas",
    status: "online",
    documents_status: "verified",
    experience_years: 7,
    hourly_rate_cents: 2000000,
    rating: 4.8,
    completed_jobs: 29,
    response_minutes: 20,
  },
];

const defaultHome: MarketplaceHome = {
  categories: defaultCategories,
  popular_services: defaultCategories.slice(0, 4),
  top_professionals: defaultProfessionals,
  stats: {},
};

export async function getMarketplaceHome(): Promise<MarketplaceHome> {
  try {
    const data = await apiGet<MarketplaceHome>("/api/v1/marketplace/home");
    if (data && Array.isArray(data.categories)) return data;
    return defaultHome;
  } catch {
    return defaultHome;
  }
}

export async function getMarketplaceTrust() {
  try {
    return await apiGet<{
      reviews?: Review[];
      professionals?: Professional[];
      stats?: Record<string, unknown>;
    }>("/api/v1/marketplace/trust");
  } catch {
    return {
      reviews: [],
      professionals: defaultProfessionals,
      stats: { total_companies: 50, trained_students: 1200, satisfaction_rate: "98%" },
    };
  }
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const data = await apiGet<ServiceCategory[]>("/api/v1/service_categories");
    if (Array.isArray(data) && data.length > 0) return data;
    return defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export async function getCategoryDetail(slug: string) {
  try {
    return await apiGet<{
      category?: ServiceCategory;
      professionals?: Professional[];
    }>(`/api/v1/service_categories/${slug}`);
  } catch {
    const category = defaultCategories.find((c) => c.slug === slug) || defaultCategories[0];
    return {
      category,
      professionals: defaultProfessionals,
    };
  }
}
