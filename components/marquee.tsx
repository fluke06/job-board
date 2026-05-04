"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  speed = 40,
  className,
  reverse = false,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number>(40);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => {
      const w = node.scrollWidth / 2 || 1;
      setDuration(w / speed);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [speed]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
        aria-hidden="true"
      />
      <div
        ref={ref}
        className="flex w-max items-center gap-8 motion-safe:[animation-name:jb-marquee] [animation-iteration-count:infinite] [animation-timing-function:linear]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}
