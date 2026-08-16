import "server-only";

import { apiGet } from "./http";
import type { MarketplaceHome, Professional, Review, ServiceCategory } from "./types";

export async function getMarketplaceHome() {
  return apiGet<MarketplaceHome>("/api/v1/marketplace/home");
}

export async function getMarketplaceTrust() {
  return apiGet<{
    reviews?: Review[];
    professionals?: Professional[];
    stats?: Record<string, unknown>;
  }>("/api/v1/marketplace/trust");
}

export async function getServiceCategories() {
  return apiGet<ServiceCategory[]>("/api/v1/service_categories");
}

export async function getCategoryDetail(slug: string) {
  return apiGet<{
    category?: ServiceCategory;
    professionals?: Professional[];
  }>(`/api/v1/service_categories/${slug}`);
}
