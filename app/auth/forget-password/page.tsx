"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedBaseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setStatus("failed");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) {
        let message = "Failed to request OTP.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          try {
            const errorText = await response.text();
            if (errorText) message = errorText;
          } catch {
            // Keep fallback message.
          }
        }
        throw new Error(message);
      }

      router.push(`/auth/otp-verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request OTP.");
      setStatus("failed");
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Image
          src="/logo-auth.svg"
          alt="Carely Pets"
          width={225}
          height={50}
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900">
        Forgot Password !
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Enter your email to reset password
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {/* Email */}
        <div className="text-left">
          <label className="text-xs font-medium text-gray-600">EMAIL</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-sky-400">
            <Image
              src="/icons/mail-01.svg"
              alt="Email icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <input
              type="email"
              placeholder="Enter email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-xl bg-sky-200 py-3 text-sm font-medium text-sky-900 hover:bg-sky-300 transition disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Next"}
        </button>
        {error ? (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => router.push("/auth/signin")}
          className="flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-sky-600 transition"
        >
          <Image
            src="/icons/arrow-left-01.svg"
            alt="Back icon"
            width={16}
            height={16}
            className="w-4 h-4"
          />
          Back to Login
        </button>
      </form>
    </div>
  );
}
