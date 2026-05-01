import { Badge } from "@/components/ui/badge";

type Status = "pending" | "reviewed" | "accepted" | "rejected";

const VARIANTS: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "bg-status-pending-bg text-status-pending-text hover:bg-status-pending-bg",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "bg-status-reviewed-bg text-status-reviewed-text hover:bg-status-reviewed-bg",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-status-accepted-bg text-status-accepted-text hover:bg-status-accepted-bg",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-status-rejected-bg text-status-rejected-text hover:bg-status-rejected-bg",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const v = VARIANTS[status];
  return (
    <Badge className={`border-transparent ${v.className}`}>{v.label}</Badge>
  );
}

export function JobStatusBadge({ status }: { status: "open" | "closed" }) {
  if (status === "open") {
    return (
      <Badge className="border-transparent bg-status-accepted-bg text-status-accepted-text hover:bg-status-accepted-bg gap-1.5">
        <span
          className="inline-block size-1.5 rounded-full bg-status-accepted-text"
          aria-hidden="true"
        />
        Open
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-status-pending-bg text-status-pending-text hover:bg-status-pending-bg gap-1.5">
      <span
        className="inline-block size-1.5 rounded-full bg-status-pending-text"
        aria-hidden="true"
      />
      Closed
    </Badge>
  );
}
