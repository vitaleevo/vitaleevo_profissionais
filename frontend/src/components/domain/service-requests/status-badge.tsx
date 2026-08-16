import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/formatters/status";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === "completed" ? "default" : status === "cancelled" ? "destructive" : "secondary";

  return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}
