"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Briefcase, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(60),
  email: z.string().trim().email("Enter a valid email").max(254),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/\d/, "Must contain a number"),
});

type FormValues = z.infer<typeof formSchema>;

type Role = "applicant" | "employer";

const ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
  description: string;
  Icon: typeof User;
}> = [
  {
    value: "applicant",
    label: "I'm looking for a job",
    description: "Apply to roles and track your applications.",
    Icon: User,
  },
  {
    value: "employer",
    label: "I'm hiring",
    description: "Post jobs and review candidates.",
    Icon: Briefcase,
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("applicant");
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, role }),
    });
    if (res.ok) {
      toast.success("Account created");
      router.push(role === "employer" ? "/employer/onboarding" : "/dashboard");
      router.refresh();
      return;
    }
    if (res.status === 409) {
      form.setError("email", { message: "Email already registered" });
      return;
    }
    if (res.status === 429) {
      toast.error("Too many attempts. Try again later.");
      return;
    }
    toast.error("Could not create account");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-small font-medium text-foreground">
            I want to…
          </legend>
          <div className="grid gap-2">
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
                    selected
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <opt.Icon
                    className="mt-0.5 size-5 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="text-small font-medium">{opt.label}</div>
                    <div className="text-caption normal-case tracking-normal text-muted-foreground">
                      {opt.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                At least 8 characters, with a letter and a number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-small text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
