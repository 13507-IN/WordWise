import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="A secure link to get back in." description="Reset links expire after 30 minutes and can only be used once.">
      <AuthForm mode="forgot" />
    </AuthLayout>
  );
}
