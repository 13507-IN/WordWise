import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { auth, googleSignInEnabled } from "@/auth";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RegisterPage({ searchParams }: Props) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  if (session) redirect("/onboarding");

  return (
    <AuthLayout title="Start with the exam you chose." description="Create an account, choose a target level and turn your date into a practical study schedule.">
      <AuthForm
        mode="register"
        googleEnabled={googleSignInEnabled}
        initialValues={{
          examLevelId: typeof query.examLevelId === "string" ? query.examLevelId : undefined,
          examDate: typeof query.examDate === "string" ? query.examDate : undefined,
          dailyMinutes: typeof query.dailyMinutes === "string" ? query.dailyMinutes : undefined,
        }}
      />
    </AuthLayout>
  );
}
