"use client";

import Image from "next/image";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "succeeded") {
      router.push("/dashboard/dashboard");
    }
  }, [router, status]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Image src="/logo-auth.svg" alt="Carely Pets" width={225} height={50} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-semibold text-gray-900">Welcome Back !</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        To login, enter your email address and password.
      </p>

      {/* Form */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="text-left">
          <label className="text-xs font-medium text-gray-600">EMAIL</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-sky-400">
            <Mail className="w-5 h-5 text-sky-500" />
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full text-gray-800 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="text-left">
          <label className="text-xs font-medium text-gray-600">PASSWORD</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-sky-400">
            <Lock className="w-5 h-5 text-sky-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full text-gray-800 text-sm outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-sky-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <button
            type="button"
            className="text-xs text-sky-600 hover:underline"
            onClick={() => router.push("/auth/forget-password")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="w-full rounded-xl bg-sky-200 py-3 text-sm font-medium text-sky-900 hover:bg-sky-300 transition disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing in..." : "Login"}
        </button>
        {error ? (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
