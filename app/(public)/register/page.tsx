import { RegisterForm } from "@/components/register-form";

export const metadata = {
  title: "Register | JobBoard",
  description: "Create a JobBoard account to apply for jobs and track your applications.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
      <RegisterForm />
    </div>
  );
}
