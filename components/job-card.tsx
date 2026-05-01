import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

export function JobCard({
  job,
}: {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: "full-time" | "part-time" | "remote";
    salaryRange?: string | null;
  };
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">
          <Link href={`/jobs/${job.id}`} className="hover:underline">
            {job.title}
          </Link>
        </CardTitle>
        <div className="text-sm text-muted-foreground">{job.company}</div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {job.location}
          </span>
          <Badge variant="secondary" className="inline-flex items-center gap-1">
            <Briefcase className="h-3 w-3" aria-hidden="true" />
            {TYPE_LABEL[job.type]}
          </Badge>
          {job.salaryRange ? (
            <span className="text-foreground/80">{job.salaryRange}</span>
          ) : null}
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-medium hover:underline"
        >
          View →
        </Link>
      </CardContent>
    </Card>
  );
}
