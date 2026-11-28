"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { startNavigationProgress } from "@/components/navigation-progress";

type Mode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode, googleEnabled = false, initialValues, resetToken }: {
  mode: Mode;
  googleEnabled?: boolean;
  initialValues?: { examLevelId?: string; examDate?: string; dailyMinutes?: string };
  resetToken?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const redirectingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Account creation failed.");
        const login = await signIn("credentials", { email, password, redirect: false });
        if (login?.error) throw new Error("Your account was created, but sign-in failed. Please sign in.");

        redirectingRef.current = true;
        setIsRedirecting(true);
        setRedirectMessage("Account ready! Setting up your study roadmap…");
        startNavigationProgress();

        const query = new URLSearchParams({
          ...(initialValues?.examLevelId ? { examLevelId: initialValues.examLevelId } : {}),
          ...(initialValues?.examDate ? { examDate: initialValues.examDate } : {}),
          ...(initialValues?.dailyMinutes ? { dailyMinutes: initialValues.dailyMinutes } : {}),
        }).toString();
        router.push(query ? `/onboarding?${query}` : "/onboarding");
        router.refresh();
        return;
      }

      if (mode === "login") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error("Email or password is incorrect.");

        redirectingRef.current = true;
        setIsRedirecting(true);
        setRedirectMessage("Signing in… Opening your dashboard");
        startNavigationProgress();

        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (mode === "forgot") {
        const response = await fetch("/api/auth/password/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = await response.json() as { error?: string; message?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not send the reset link.");
        setMessage(result.message ?? "If the account exists, a reset link has been sent.");
        return;
      }

      if (password !== confirmPassword) throw new Error("The passwords do not match.");
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update your password.");
      setMessage("Your password has been updated. You can now sign in.");

      redirectingRef.current = true;
      setIsRedirecting(true);
      setRedirectMessage("Password updated! Taking you to sign in…");
      startNavigationProgress();
      window.setTimeout(() => router.replace("/login"), 800);
    } catch (caught) {
      redirectingRef.current = false;
      setIsRedirecting(false);
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally {
      if (!redirectingRef.current) {
        setBusy(false);
      }
    }
  }

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const title = isRegister ? "Create your account" : mode === "login" ? "Sign in to LinguaCamp" : isForgot ? "Reset your password" : "Choose a new password";
  const intro = isRegister
    ? "Save your exam target and build a study plan."
    : mode === "login"
      ? "Continue with your exam preparation."
      : isForgot
        ? "We’ll send a one-time reset link if the account exists."
        : "Use at least 10 characters for your new password.";

  const isFormLocked = busy || isRedirecting;

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <p>{intro}</p>

      {isRedirecting && (
        <div className="auth-redirect-notice" role="status" aria-live="polite">
          <span className="nav-inline-spinner" />
          <div>
            <strong>{redirectMessage}</strong>
            <p>Connecting your exam preparation roadmap…</p>
          </div>
        </div>
      )}

      {isRegister && (
        <div className="auth-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            autoComplete="name"
            required
            maxLength={80}
            disabled={isFormLocked}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      )}

      {!isReset && (
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            disabled={isFormLocked}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      )}

      {!isForgot && (
        <div className="auth-field">
          <label htmlFor="password">{isReset ? "New password" : "Password"}</label>
          <input
            id="password"
            type="password"
            autoComplete={isRegister || isReset ? "new-password" : "current-password"}
            required
            minLength={isRegister || isReset ? 10 : 1}
            maxLength={128}
            disabled={isFormLocked}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      )}

      {isReset && (
        <div className="auth-field">
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            disabled={isFormLocked}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      )}

      {mode === "login" && (
        <p className="small-copy">
          <Link href="/forgot-password" tabIndex={isFormLocked ? -1 : 0}>
            Forgot your password?
          </Link>
        </p>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}

      <button className="button" type="submit" disabled={isFormLocked}>
        {isRedirecting ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <span className="nav-inline-spinner" />
            <span>Loading dashboard…</span>
          </span>
        ) : busy ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <span className="nav-inline-spinner" />
            <span>Please wait…</span>
          </span>
        ) : isRegister ? (
          "Create account"
        ) : mode === "login" ? (
          "Sign in"
        ) : isForgot ? (
          "Send reset link"
        ) : (
          "Update password"
        )}
      </button>

      {googleEnabled && (mode === "login" || isRegister) && (
        <>
          <div className="auth-divider"><span>or</span></div>
          <button
            className="button button-secondary"
            type="button"
            disabled={isFormLocked}
            onClick={() => {
              redirectingRef.current = true;
              setIsRedirecting(true);
              setRedirectMessage("Connecting with Google… Opening your dashboard");
              startNavigationProgress();
              signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            {isRedirecting && redirectMessage.includes("Google") ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <span className="nav-inline-spinner" />
                <span>Connecting…</span>
              </span>
            ) : (
              "Continue with Google"
            )}
          </button>
        </>
      )}

      {!googleEnabled && (mode === "login" || isRegister) && (
        <p className="form-hint">Google sign-in is available after an administrator adds OAuth credentials.</p>
      )}

      {(mode === "login" || isRegister) && (
        <p className="small-copy">
          {isRegister ? "Already registered? " : "New to LinguaCamp? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            tabIndex={isFormLocked ? -1 : 0}
            style={isFormLocked ? { pointerEvents: "none", opacity: 0.6 } : undefined}
          >
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      )}
    </form>
  );
}
