"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CompaniesSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.push(`/companies${next.toString() ? `?${next}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full md:w-[400px]">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <Input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search companies"
        className="pl-9"
        aria-label="Search companies"
      />
    </form>
  );
}
