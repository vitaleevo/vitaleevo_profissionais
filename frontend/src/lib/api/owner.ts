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
    billed_revenue_cents: number;
    estimated_revenue_cents: number;
    active_contracts: number;
    allocated_professionals: number;
    academy_students: number;
    pending_quotes: number;
    pending_professionals: number;
    total_users: number;
    admin_users: number;
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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-ff93.up.railway.app";

export async function fetchOwnerDashboard(token?: string): Promise<OwnerDashboardData | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${apiBaseUrl}/api/v1/owner/dashboard/`, {
      headers,
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

export async function performProfessionalAction(
  professionalId: number,
  action: "approve" | "reject",
  reason: string,
  token?: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBaseUrl}/api/v1/owner/professionals/${professionalId}/action/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, reason }),
  });

  return res.json();
}

export async function performQuoteAction(
  quoteId: string,
  status: "approved" | "rejected" | "proposal_sent" | "in_progress",
  reason?: string,
  token?: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBaseUrl}/api/v1/owner/quotes/${quoteId}/action/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status, reason: reason || "Atualizado pelo Dono" }),
  });

  return res.json();
}
