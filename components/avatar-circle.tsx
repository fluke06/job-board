import { cn } from "@/lib/utils";

const PALETTES: Array<[string, string]> = [
  ["from-violet-400", "to-fuchsia-500"],
  ["from-sky-400", "to-indigo-500"],
  ["from-emerald-400", "to-teal-500"],
  ["from-amber-400", "to-orange-500"],
  ["from-rose-400", "to-pink-500"],
  ["from-cyan-400", "to-blue-500"],
  ["from-lime-400", "to-emerald-500"],
  ["from-fuchsia-400", "to-rose-500"],
];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

const SIZE_CLASS = {
  xs: "size-6 text-[11px]",
  sm: "size-8 text-xs",
  md: "size-10 text-small",
  lg: "size-12 text-body",
};

export function AvatarCircle({
  name,
  seed,
  size = "md",
  className,
}: {
  name: string;
  seed?: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  const idx = hashString(seed ?? name) % PALETTES.length;
  const [from, to] = PALETTES[idx];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm bg-gradient-to-br",
        from,
        to,
        SIZE_CLASS[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
