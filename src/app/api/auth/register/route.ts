import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { allowRequest, getRequestAddress } from "@/lib/rate-limit";

const registrationSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(10).max(128),
});

export async function POST(request: Request) {
  const address = getRequestAddress(request);
  if (!allowRequest(`register:${address}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form and try again." }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        profile: { create: {} },
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Account registration failed.");
    return NextResponse.json({ error: "Account creation failed. Please try again." }, { status: 500 });
  }
}
