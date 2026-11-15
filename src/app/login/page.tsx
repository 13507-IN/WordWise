import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { auth, googleSignInEnabled } from "@/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <AuthLayout title="Your exam plan, ready when you are." description="Sign in to continue your study schedule, practice sets and results.">
      <AuthForm mode="login" googleEnabled={googleSignInEnabled} />
    </AuthLayout>
  );
}
