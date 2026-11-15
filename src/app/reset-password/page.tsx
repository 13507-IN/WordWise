import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  return (
    <AuthLayout title="Choose a new password." description="The reset link is single-use and expires after 30 minutes.">
      {token
        ? <AuthForm mode="reset" resetToken={token} />
        : <p className="form-error" role="alert">This reset link is missing its token. Request a new link.</p>}
    </AuthLayout>
  );
}
