"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

type Status = "pending" | "reviewed" | "accepted" | "rejected";

export function ApplicationStatusSelect({
  applicationId,
  value,
}: {
  applicationId: string;
  value: Status;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Status>(value);
  const [isPending, startTransition] = useTransition();

  async function onChange(next: Status) {
    const prev = current;
    setCurrent(next);
    const res = await fetch(
      `/api/admin/applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      },
    );
    if (!res.ok) {
      setCurrent(prev);
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error ?? "Failed to update status");
      return;
    }
    toast.success("Status updated");
    startTransition(() => router.refresh());
  }

  return (
    <Select
      value={current}
      onValueChange={(v) => v && onChange(v as Status)}
      disabled={isPending}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
