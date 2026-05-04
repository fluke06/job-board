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

type Role = "applicant" | "employer" | "admin";

const ROLES: Array<{ value: Role; label: string }> = [
  { value: "applicant", label: "Applicant" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Admin" },
];

export function UserRoleSelect({
  userId,
  value,
  disabled = false,
}: {
  userId: string;
  value: Role;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Role>(value);
  const [isPending, startTransition] = useTransition();

  async function onChange(next: Role) {
    if (next === current) return;
    const prev = current;
    setCurrent(next);
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    if (!res.ok) {
      setCurrent(prev);
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error ?? "Failed to update role");
      return;
    }
    toast.success("Role updated");
    startTransition(() => router.refresh());
  }

  return (
    <Select
      value={current}
      onValueChange={(v) => v && onChange(v as Role)}
      disabled={disabled || isPending}
    >
      <SelectTrigger className="h-8 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
