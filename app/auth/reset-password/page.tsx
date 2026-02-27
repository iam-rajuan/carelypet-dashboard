import { Suspense } from "react";

import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
