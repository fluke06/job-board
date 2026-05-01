"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(30, "Cover letter must be at least 30 characters")
    .max(3000, "Cover letter must be at most 3000 characters"),
  resumeUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2048)
    .or(z.literal(""))
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ApplyDialog({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { coverLetter: "", resumeUrl: "" },
  });

  async function onSubmit(values: FormValues) {
    const body = {
      coverLetter: values.coverLetter,
      resumeUrl: values.resumeUrl ? values.resumeUrl : null,
    };
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success("Application submitted");
      form.reset();
      setOpen(false);
      router.refresh();
      return;
    }
    const err = await res.json().catch(() => ({}));
    toast.error(err?.error ?? "Failed to submit application");
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Apply</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for this job</DialogTitle>
          <DialogDescription>
            Tell us why you&apos;re a fit. You can apply only once per job.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover letter</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Why are you a great fit?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resumeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting…" : "Submit application"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      </Dialog>
    </>
  );
}
