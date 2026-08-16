import type { components, paths } from "./schema";

export type ApiErrorBody = components["schemas"]["ErrorResponse"]["error"];
export type ServiceCategory = components["schemas"]["ServiceCategory"];
export type Professional = components["schemas"]["Professional"];
export type ProfessionalDocument = components["schemas"]["ProfessionalDocument"];
export type ServiceRequest = components["schemas"]["ServiceRequest"];
export type Payment = components["schemas"]["Payment"];
export type Match = components["schemas"]["Match"];
export type Review = components["schemas"]["Review"];
export type User = components["schemas"]["User"];
export type Client = components["schemas"]["Client"];

export type MarketplaceHome = NonNullable<
  paths["/api/v1/marketplace/home"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

export type AccountSummary = NonNullable<
  paths["/api/v1/account"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

export type OperationsDashboard = NonNullable<
  paths["/api/v1/dashboard"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;
