"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useAppSelector } from "../store/hooks";

interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ collapsed, toggleSidebar }: NavbarProps) {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!normalizedBaseUrl) {
        setError("NEXT_PUBLIC_API_BASE_URL is not set.");
        return;
      }
      if (!accessToken) {
        setError("Missing access token.");
        return;
      }

      setError(null);
      try {
        const response = await fetch(`${normalizedBaseUrl}/admin/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          let message = "Failed to fetch profile.";
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

        const body = await response.json();
        const payload = body?.data;
        if (!payload) throw new Error("Invalid profile response.");

        setProfile({
          name: payload?.name ?? "Admin",
          email: payload?.email ?? "-",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, [accessToken, normalizedBaseUrl]);

  return (
    <header
      className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 
  fixed top-0 z-20 transition-all duration-300 
  ${
    collapsed ? "left-20 w-[calc(100%-80px)]" : "left-64 w-[calc(100%-256px)]"
  }`}
    >
      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition"
      >
        <img src="/btn.svg" className="w-10 h-10 opacity-90" />
      </button>

      {/* Profile right side */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-right">
          <p className="text-[15px] font-medium text-gray-800">
            {profile?.name ?? "Admin"}
          </p>
          <p className="text-[13px] text-gray-500">
            {error ? "Profile unavailable" : profile?.email ?? "-"}
          </p>
        </div>
      </div>
    </header>
  );
}
