import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-3">
              <Image
                src="/logo/logo.svg"
                alt="Carely Pets"
                width={160}
                height={40}
                priority
              />
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                Admin Portal
              </span>
            </div>
            <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
              Manage pet care services with clarity and speed.
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
              Review service requests, track appointments, and keep customer
              care flowing smoothly from a single dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-xl bg-sky-200 px-6 py-3 text-sm font-semibold text-sky-900 shadow-sm transition hover:bg-sky-300"
              >
                Go to Sign In
              </Link>
              <span className="text-sm text-gray-500">
                Secure access for administrators only.
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute -right-6 top-8 h-40 w-40 rounded-full bg-sky-100 blur-2xl" />
            <div className="absolute -left-10 bottom-6 h-32 w-32 rounded-full bg-amber-100 blur-2xl" />
            <div className="relative w-full rounded-3xl border border-sky-100 bg-white/80 p-8 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                  <Image src="/paw.svg" alt="" width={28} height={28} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Today&apos;s Focus
                  </p>
                  <p className="text-xs text-gray-500">
                    Appointments, payments, and updates
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  "Service requests overview",
                  "Customer and pet profiles",
                  "Payment status at a glance",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
