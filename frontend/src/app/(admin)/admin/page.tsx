import { OwnerDashboard } from "./owner-dashboard";
import { requireOwnerSession } from "@/lib/server/owner-session";

export const dynamic = "force-dynamic";

export default async function OwnerAdminDashboardPage() {
  const owner = await requireOwnerSession();

  return <OwnerDashboard owner={owner} />;
}
