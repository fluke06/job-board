import { Badge } from "@/components/ui/badge";

type Status = "pending" | "reviewed" | "accepted" | "rejected";

const VARIANTS: Record<
  Status,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-blue-100 text-blue-900 hover:bg-blue-100",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-900 hover:bg-rose-100",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const v = VARIANTS[status];
  return <Badge className={v.className}>{v.label}</Badge>;
}
