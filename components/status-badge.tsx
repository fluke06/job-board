import { cn } from "@/lib/utils";

type Status = "pending" | "reviewed" | "accepted" | "rejected";

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "bg-status-pending-bg text-status-pending-text border-status-pending-text/30",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "bg-status-reviewed-bg text-status-reviewed-text border-status-reviewed-text/30",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-status-accepted-bg text-status-accepted-text border-status-accepted-text/30",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-status-rejected-bg text-status-rejected-text border-status-rejected-text/30",
  },
};

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider";

export function StatusBadge({ status }: { status: Status }) {
  const v = STATUS_STYLE[status];
  return <span className={cn(PILL_BASE, v.className)}>{v.label}</span>;
}

export function JobStatusBadge({ status }: { status: "open" | "closed" }) {
  if (status === "open") {
    return (
      <span
        className={cn(
          PILL_BASE,
          "bg-status-accepted-bg text-status-accepted-text border-status-accepted-text/30",
        )}
      >
        <span
          className="inline-block size-1.5 rounded-full bg-status-accepted-text jb-anim-pulse-dot"
          aria-hidden="true"
        />
        Open
      </span>
    );
  }
  return (
    <span
      className={cn(
        PILL_BASE,
        "bg-status-pending-bg text-status-pending-text border-status-pending-text/30",
      )}
    >
      <span
        className="inline-block size-1.5 rounded-full bg-status-pending-text"
        aria-hidden="true"
      />
      Closed
    </span>
  );
}
