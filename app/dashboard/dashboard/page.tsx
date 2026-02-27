"use client";

import { useEffect, useMemo, useState } from "react";
import DropdownSelect from "../../components/DropDownSelect";
import { Dog, Heart, Pencil } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "../../store/hooks";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthLabels = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export default function DashboardPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months[today.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
  const [metricsYear, setMetricsYear] = useState(String(today.getFullYear()));
  const [breakdown, setBreakdown] = useState<{
    adoption: number;
    service: number;
    total: number;
    currency: string;
  } | null>(null);
  const [breakdownStatus, setBreakdownStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [userMetrics, setUserMetrics] = useState<number[]>([]);
  const [metricsStatus, setMetricsStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const years = useMemo(() => {
    const current = today.getFullYear();
    return Array.from({ length: 5 }, (_, index) => String(current - index));
  }, [today]);

  useEffect(() => {
    const fetchBreakdown = async () => {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex < 0) return;
      if (!normalizedBaseUrl) {
        setBreakdownError("NEXT_PUBLIC_API_BASE_URL is not set.");
        setBreakdownStatus("failed");
        return;
      }
      if (!accessToken) {
        setBreakdownError("Missing access token.");
        setBreakdownStatus("failed");
        return;
      }

      setBreakdownStatus("loading");
      setBreakdownError(null);

      try {
        const response = await fetch(
          `${normalizedBaseUrl}/admin/dashboard/monthly-breakdown?month=${
            monthIndex
          }&year=${selectedYear}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to fetch monthly breakdown.";
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
        if (!payload) throw new Error("Invalid monthly breakdown response.");

        setBreakdown({
          adoption: Number(payload?.adoption ?? 0),
          service: Number(payload?.service ?? 0),
          total: Number(payload?.total ?? 0),
          currency: String(payload?.currency ?? "usd"),
        });
        setBreakdownStatus("idle");
      } catch (err) {
        setBreakdownError(
          err instanceof Error
            ? err.message
            : "Failed to fetch monthly breakdown.",
        );
        setBreakdownStatus("failed");
      }
    };

    fetchBreakdown();
  }, [accessToken, normalizedBaseUrl, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!normalizedBaseUrl) {
        setMetricsError("NEXT_PUBLIC_API_BASE_URL is not set.");
        setMetricsStatus("failed");
        return;
      }
      if (!accessToken) {
        setMetricsError("Missing access token.");
        setMetricsStatus("failed");
        return;
      }

      setMetricsStatus("loading");
      setMetricsError(null);

      try {
        const response = await fetch(
          `${normalizedBaseUrl}/admin/dashboard/user-metrics?year=${metricsYear}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to fetch user metrics.";
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
        if (!payload) throw new Error("Invalid user metrics response.");

        const users = Array.isArray(payload?.users) ? payload.users : [];
        setUserMetrics(users.map((value: number) => Number(value ?? 0)));
        setMetricsStatus("idle");
      } catch (err) {
        setMetricsError(
          err instanceof Error ? err.message : "Failed to fetch user metrics.",
        );
        setMetricsStatus("failed");
      }
    };

    fetchMetrics();
  }, [accessToken, metricsYear, normalizedBaseUrl]);

  const metricsChart = useMemo(
    () =>
      monthLabels.map((label, index) => ({
        name: label,
        value: Number(userMetrics[index] ?? 0),
      })),
    [userMetrics],
  );

  const formatMoney = (value: number, currency: string) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 2,
      }).format(safeValue);
    } catch {
      return `$${safeValue.toFixed(2)}`;
    }
  };

  const breakdownCurrency = breakdown?.currency ?? "usd";

  return (
    <div className="space-y-8 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Monthly Breakdown
          </h1>
          <p className="text-gray-500 text-sm">
            This section will show monthly income of your app.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownSelect
            label={selectedMonth}
            options={months}
            onChange={setSelectedMonth}
          />
          <DropdownSelect
            label={selectedYear}
            options={years}
            onChange={setSelectedYear}
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="ADOPTION"
          value={
            breakdownStatus === "loading"
              ? "Loading..."
              : formatMoney(breakdown?.adoption ?? 0, breakdownCurrency)
          }
          icon={<Dog className="h-5 w-5 text-[#00A7C7]" />}
        />
        <SummaryCard
          title="SERVICE"
          value={
            breakdownStatus === "loading"
              ? "Loading..."
              : formatMoney(breakdown?.service ?? 0, breakdownCurrency)
          }
          icon={<Heart className="h-5 w-5 text-[#00A7C7]" />}
        />
        <SummaryCard
          title="TOTAL"
          value={
            breakdownStatus === "loading"
              ? "Loading..."
              : formatMoney(breakdown?.total ?? 0, breakdownCurrency)
          }
          icon={<Pencil className="h-5 w-5 text-[#00A7C7]" />}
        />
      </div>
      {breakdownStatus === "failed" ? (
        <p className="text-sm text-red-600">
          {breakdownError ?? "Failed to load monthly breakdown."}
        </p>
      ) : null}

      {/* USER METRICS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">User Metrics</h2>

          <DropdownSelect
            label={metricsYear}
            options={years}
            onChange={setMetricsYear}
          />
        </div>

        <div className="w-full h-[300px] md:h-[380px]">
          {metricsStatus === "failed" ? (
            <div className="flex h-full items-center justify-center text-sm text-red-600">
              {metricsError ?? "Failed to load user metrics."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#00A7C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs tracking-wide text-gray-900">{title}</p>
        <p className="text-2xl text-gray-900 font-semibold mt-1">{value}</p>
      </div>
      <div className="p-3 bg-[#D6F2F8] rounded-xl">{icon}</div>
    </div>
  );
}
