import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("Failed to elevate user role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
