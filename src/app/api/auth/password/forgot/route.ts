import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { allowRequest, getRequestAddress } from "@/lib/rate-limit";

const schema = z.object({ email: z.email().trim().toLowerCase().max(254) });

export async function POST(request: Request) {
  const address = getRequestAddress(request);
  if (!allowRequest(`forgot:${address}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return NextResponse.json({ error: "Password reset email is not configured on this server." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, email: true } });
  if (user) {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60_000) },
    });

    const resetUrl = new URL("/reset-password", process.env.AUTH_URL ?? "http://localhost:3000");
    resetUrl.searchParams.set("token", token);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [user.email],
        subject: "Reset your LinguaCamp password",
        text: `Use this one-time link within 30 minutes to reset your password: ${resetUrl.toString()}`,
      }),
    });

    if (!response.ok) {
      await prisma.passwordResetToken.delete({ where: { tokenHash } });
      console.error("Password reset email could not be delivered.");
      return NextResponse.json({ error: "Password reset email could not be sent. Try again later." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, message: "If the account exists, a reset link has been sent." });
}
