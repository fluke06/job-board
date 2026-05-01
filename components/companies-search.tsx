import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CompaniesSearch({ defaultQ }: { defaultQ?: string }) {
  return (
    <form action="/companies" method="get" className="relative w-full md:w-[400px]">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <Input
        type="search"
        name="q"
        defaultValue={defaultQ ?? ""}
        placeholder="Search companies"
        className="pl-9"
        aria-label="Search companies"
      />
    </form>
  );
}
