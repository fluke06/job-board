"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = [
  { value: "any", label: "Any" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "remote", label: "Remote" },
];

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState(params.get("type") ?? "any");
  const [location, setLocation] = useState(params.get("location") ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (type && type !== "any") next.set("type", type);
    if (location.trim()) next.set("location", location.trim());
    router.push(`/jobs${next.toString() ? `?${next}` : ""}`);
  }

  function onReset() {
    setQ("");
    setType("any");
    setLocation("");
    router.push("/jobs");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border p-4"
      aria-label="Filter jobs"
    >
      <div className="space-y-1.5">
        <Label htmlFor="filter-q">Search</Label>
        <Input
          id="filter-q"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Title, company, keyword"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="filter-type">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? "any")}>
          <SelectTrigger id="filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="filter-location">Location</Label>
        <Input
          id="filter-location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Manila, Remote"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Apply
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </form>
  );
}
