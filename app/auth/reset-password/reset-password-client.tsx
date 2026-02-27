"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!normalizedBaseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setStatus("failed");
      return;
    }
    if (!email) {
      setError("Missing email for password reset.");
      setStatus("failed");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      setStatus("failed");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            newPassword: form.newPassword,
          }),
        },
      );

      if (!response.ok) {
        let message = "Failed to reset password.";
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

      router.push("/auth/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
      setStatus("failed");
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <h1 className="text-3xl font-semibold text-center text-black mb-4">
        Logo
      </h1>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-black mb-1">
        Set new password
      </h2>
      <p className="text-center text-text-secondary mb-6 text-sm text-black">
        Set a new password and continue your journey
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label className="block text-gray-600 text-sm font-semibold text-text-tertiary mb-2">
            New Password
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/square-lock-01.svg"
              alt="lock icon"
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
            />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              required
              className="flex-1 text-black bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
            <Image
              src={
                showNewPassword ? "/icons/view-closed.svg" : "/icons/view.svg"
              }
              alt="toggle password"
              width={20}
              height={20}
              onClick={() => setShowNewPassword((p) => !p)}
              className="w-5 h-5 opacity-70 cursor-pointer ml-2 hover:opacity-100 transition"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-600 text-gray-600text-sm font-semibold text-text-tertiary mb-2">
            Confirm Password
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/square-lock-01.svg"
              alt="lock icon"
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Retype password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              className="flex-1 text-black bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
            <Image
              src={
                showConfirmPassword
                  ? "/icons/view-closed.svg"
                  : "/icons/view.svg"
              }
              alt="toggle confirm password"
              width={20}
              height={20}
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="w-5 h-5 opacity-70 cursor-pointer ml-2 hover:opacity-100 transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="
            w-full bg-blue-500 hover:bg-blue-700
            text-text-inverted font-semibold
            py-3 sm:py-3.5 rounded-lg transition
          "
          disabled={status === "loading"}
        >
          {status === "loading" ? "Updating..." : "Next"}
        </button>
        {error ? (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {/* Resend + Back */}
        <div className="flex flex-col items-center gap-3 text-sm text-black mt-1">
          <p className="text-text-tertiary">
            Don't receive OTP?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Resend again
            </button>
          </p>

          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="flex items-center gap-2 text-text-tertiary text-blue-500 hover:text-blue-700 transition"
          >
            <Image
              src="/icons/arrow-left-01.svg"
              alt="Back icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
