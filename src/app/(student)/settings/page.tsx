import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function StudyPreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  redirect("/onboarding?edit=1");
}
