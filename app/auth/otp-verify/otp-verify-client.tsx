"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function OtpVerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "example@gmail.com";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "success" | "failed"
  >("idle");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) return;
    if (!normalizedBaseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setStatus("failed");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: code,
          }),
        },
      );

      if (!response.ok) {
        let message = "Failed to verify OTP.";
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

      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP.");
      setStatus("failed");
    }
  };

  const handleResend = async () => {
    if (!normalizedBaseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setResendStatus("failed");
      return;
    }

    setResendStatus("loading");
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
        let message = "Failed to resend OTP.";
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

      setResendStatus("success");
    } catch (err) {
      setResendStatus("failed");
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo-auth.svg"
          alt="Carely Pets"
          width={225}
          height={50}
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900">Verify Code</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        We sent OTP code to your email <br />
        <span className="font-medium text-gray-700">{email}</span>.
        Enter the code below to verify.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-6"
      >
        {/* OTP Inputs */}
        <div className="flex gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="
                w-14 h-14 rounded-xl text-center text-gray-800 text-lg font-semibold
                border border-gray-300
                focus:border-sky-500 focus:outline-none
              "
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-xl bg-sky-200 py-3 text-sm font-medium text-sky-900 hover:bg-sky-300 transition disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Verifying..." : "Next"}
        </button>
        {error ? (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {/* Resend */}
        <p className="text-sm text-gray-600">
          Don't receive OTP?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-sky-600 font-medium hover:underline"
            disabled={resendStatus === "loading"}
          >
            {resendStatus === "loading" ? "Resending..." : "Resend again"}
          </button>
        </p>
        {resendStatus === "success" ? (
          <p className="text-xs text-green-600">OTP sent again.</p>
        ) : null}
      </form>
    </div>
  );
}
