export type OwnerDashboardData = {
  meta: {
    period: string;
    currency: string;
    updated_at: string;
    owner: {
      email: string;
      role: string;
      is_superuser: boolean;
    };
  };
  metrics: {
    billed_revenue_cents: number | null;
    estimated_revenue_cents: number | null;
    active_contracts: number | null;
    allocated_professionals: number | null;
    academy_students: number | null;
    pending_quotes: number | null;
    pending_professionals: number | null;
    total_users: number;
    admin_users: number;
  };
  data_availability: {
    contracts: boolean;
    financials: boolean;
    professionals: boolean;
    quotes: boolean;
  };
  divisions: Array<{
    key: "training" | "academy" | "outsourcing" | "cleaning";
    num: string;
    name: string;
    badge: string;
    active_programs: number;
    professionals_count: number;
    monthly_billing_cents: number;
    status: string;
    status_label: string;
  }>;
  audit_logs: Array<{
    id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    details: Record<string, unknown>;
    user_email: string;
    created_at: string;
  }>;
};

export async function fetchOwnerDashboard(): Promise<OwnerDashboardData | null> {
  try {
    const res = await fetch("/api/owner/dashboard", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as OwnerDashboardData;
  } catch {
    return null;
  }
}
