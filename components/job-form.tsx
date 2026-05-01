"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().trim().min(3).max(120),
  companyId: z.string().trim().min(1, "Pick a company"),
  location: z.string().trim().min(2).max(80),
  type: z.enum(["full-time", "part-time", "remote"]),
  salaryRange: z.string().trim().max(60).optional(),
  description: z.string().trim().min(20).max(5000),
  requirements: z.string().trim().min(10).max(3000),
  status: z.enum(["open", "closed"]),
});

type FormValues = z.infer<typeof formSchema>;

export type JobFormDefaults = Partial<FormValues>;

const EMPTY_DEFAULTS: FormValues = {
  title: "",
  companyId: "",
  location: "",
  type: "full-time",
  salaryRange: "",
  description: "",
  requirements: "",
  status: "open",
};

export type CompanyOption = { id: string; name: string };

export function JobForm({
  mode,
  jobId,
  defaultValues,
  companies,
  endpoint,
  cancelHref = "/admin/jobs",
  successHref = "/admin/jobs",
  hideCompany = false,
}: {
  mode: "create" | "edit";
  jobId?: string;
  defaultValues?: JobFormDefaults;
  companies?: CompanyOption[];
  endpoint?: { create: string; update: (id: string) => string };
  cancelHref?: string;
  successHref?: string;
  hideCompany?: boolean;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  async function onSubmit(values: FormValues) {
    const body = {
      ...values,
      salaryRange: values.salaryRange?.trim() ? values.salaryRange.trim() : null,
    };
    const createUrl = endpoint?.create ?? "/api/jobs";
    const updateUrl = endpoint?.update ?? ((id: string) => `/api/jobs/${id}`);
    const url = mode === "create" ? createUrl : updateUrl(jobId!);
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(mode === "create" ? "Job created" : "Job updated");
      router.push(successHref);
      router.refresh();
      return;
    }
    const err = await res.json().catch(() => ({}));
    toast.error(err?.error ?? "Failed to save");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {!hideCompany && companies ? (
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(v) => field.onChange(v ?? "")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? "full-time")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? "open")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="salaryRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary range (optional)</FormLabel>
              <FormControl>
                <Input placeholder="$60k–$90k" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Create job"
                : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelHref)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
