import { Suspense } from "react";

import OtpVerifyClient from "./otp-verify-client";

export default function OtpVerifyPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center">Loading...</div>}>
      <OtpVerifyClient />
    </Suspense>
  );
}
