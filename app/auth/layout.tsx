import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background SVG */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none px-4 sm:px-8 md:px-12">
        <Image
          src="/auth-bg.svg"
          alt="Paw Illustration"
          width={1000}
          height={500}
          priority
          className="w-full mb-20 max-w-[1400px] h-auto object-contain"
        />
      </div>

      {/* Auth Card */}
      <div
        className="
          relative z-10 my-5 flex flex-col items-center justify-center
          bg-white shadow-md rounded-2xl
          w-[90%] sm:w-[400px] md:w-[430px] lg:w-[460px]
          p-6 sm:p-8 md:p-10
          backdrop-blur-sm
        "
      >
        {children}
      </div>
    </section>
  );
}
