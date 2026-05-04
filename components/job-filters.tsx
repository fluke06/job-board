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

const POSTED = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const SORT = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most applied" },
];

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState(params.get("type") ?? "any");
  const [location, setLocation] = useState(params.get("location") ?? "");
  const [posted, setPosted] = useState(params.get("posted") ?? "any");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (type && type !== "any") next.set("type", type);
    if (location.trim()) next.set("location", location.trim());
    if (posted && posted !== "any") next.set("posted", posted);
    if (sort && sort !== "newest") next.set("sort", sort);
    router.push(`/jobs${next.toString() ? `?${next}` : ""}`);
  }

  function onReset() {
    setQ("");
    setType("any");
    setLocation("");
    setPosted("any");
    setSort("newest");
    router.push("/jobs");
  }

  const activeCount =
    [
      q.trim(),
      type !== "any" ? type : "",
      location.trim(),
      posted !== "any" ? posted : "",
      sort !== "newest" ? sort : "",
    ].filter(Boolean).length;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_var(--foreground)]"
      aria-label="Filter jobs"
    >
      <div className="flex items-center justify-between">
        <span className="text-caption text-brand-strong">Filters</span>
        {activeCount > 0 ? (
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
            {activeCount} active
          </span>
        ) : null}
      </div>
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
      <div className="space-y-1.5">
        <Label htmlFor="filter-posted">Posted</Label>
        <Select value={posted} onValueChange={(v) => setPosted(v ?? "any")}>
          <SelectTrigger id="filter-posted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSTED.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="filter-sort">Sort by</Label>
        <Select value={sort} onValueChange={(v) => setSort(v ?? "newest")}>
          <SelectTrigger id="filter-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={activeCount === 0}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
