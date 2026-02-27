"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VerificationSuccessPage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* Illustration */}
      <div className="mb-6">
        <Image
          src="/verify-logo.svg"
          alt="Verification success"
          width={260}
          height={200}
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Successfully Verified
      </h1>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Please set a new password. To set a new password press on continue...
      </p>

      {/* Continue Button */}
      <button
        onClick={() => router.push("/reset-password")}
        className="w-full rounded-xl bg-sky-200 py-3 text-sm font-medium text-sky-900 hover:bg-sky-300 transition"
      >
        Continue
      </button>
    </div>
  );
}
