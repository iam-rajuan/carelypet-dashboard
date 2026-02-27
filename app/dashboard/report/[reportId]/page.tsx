"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "../../../store/hooks";
import ConfirmModal from "../ConfirmModal";

/* -----------------------------
      TYPES
------------------------------*/

type Reporter = {
  name: string;
  username: string;
  avatar: string | null;
};

type ReportData = {
  id: string;
  count: number;
  status: "pending" | "resolved" | "dismissed" | string;
  contentImage: string | null;
  contentText: string;
  user: Reporter;
  reasons: string[];
};

interface InfoCardProps {
  title: string;
  value: string | number;
  iconBg: string;
  icon: React.ReactNode;
}

interface StatusBadgeProps {
  status: "pending" | "resolved" | "dismissed" | string;
}

interface ReporterCardProps {
  title: string;
  user: Reporter;
}

/* -----------------------------
   COMPONENTS (TYPED)
------------------------------*/

function InfoCard({ title, value, iconBg, icon }: InfoCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-gray-100 text-gray-600",
  };

  const dot: Record<string, string> = {
    pending: "bg-yellow-500",
    resolved: "bg-green-500",
    dismissed: "bg-gray-400",
  };

  const normalized = status?.toLowerCase?.() ?? "pending";
  const display = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 w-fit ${
        colors[normalized] ?? colors.pending
      }`}
    >
      {display}
      <span
        className={`h-2 w-2 rounded-full ${dot[normalized] ?? dot.pending}`}
      />
    </span>
  );
}

function ReporterCard({ title, user }: ReporterCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <img
        src={user.avatar ?? "https://placehold.co/80x80?text=User"}
        className="w-10 h-10 rounded-full object-cover"
        alt="User avatar"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-700">{user.name}</p>
        <p className="text-xs text-gray-500">{user.username}</p>
      </div>
    </div>
  );
}

function ReasonCard({ reason }: { reason: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-900">Reported Reason</p>

      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
        CONTENT VIOLATIONS
      </p>

      <p className="text-sm text-gray-700 mt-1">{reason}</p>
    </div>
  );
}

/* -----------------------------
      MAIN PAGE
------------------------------*/

export default function ReportDetailsPage() {
  const [actionOpen, setActionOpen] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<
    "delete" | "remove" | "warn" | "dismiss"
  >("delete");
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const params = useParams<{ reportId: string }>();
  const reportId = params?.reportId;
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      if (!normalizedBaseUrl) {
        setError("NEXT_PUBLIC_API_BASE_URL is not set.");
        setStatus("failed");
        return;
      }
      if (!accessToken) {
        setError("Missing access token.");
        setStatus("failed");
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(
          `${normalizedBaseUrl}/admin/reports/${reportId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to fetch report details.";
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

        const data = await response.json();
        const item = data?.data;
        if (!item || typeof item !== "object") {
          throw new Error("Invalid report response.");
        }

        const media = Array.isArray(item.post?.media) ? item.post.media : [];
        const firstImage = media.find((m: { type?: string }) =>
          m?.type ? m.type === "image" : false,
        );

        setReport({
          id: item.id ?? "",
          count: item.count ?? 0,
          status: item.status ?? "pending",
          contentImage: firstImage?.url ?? null,
          contentText: item.post?.text ?? "",
          user: {
            name: item.reportedUser?.name ?? "Unknown",
            username: item.reportedUser?.username
              ? `@${item.reportedUser.username}`
              : "@unknown",
            avatar: item.reportedUser?.avatarUrl ?? null,
          },
          reasons: Array.isArray(item.reasons) ? item.reasons : [],
        });
        setStatus("idle");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch report details.",
        );
        setStatus("failed");
      }
    };

    fetchReport();
  }, [accessToken, normalizedBaseUrl, reportId]);

  const handleDeleteReport = async () => {
    if (!reportId) return;
    if (!normalizedBaseUrl) {
      setDeleteError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setDeleteStatus("failed");
      return;
    }
    if (!accessToken) {
      setDeleteError("Missing access token.");
      setDeleteStatus("failed");
      return;
    }

    setDeleteStatus("loading");
    setDeleteError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to delete report.";
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

      setDeleteStatus("idle");
      setDeleteOpen(false);
      router.push("/dashboard/report");
    } catch (err) {
      setDeleteStatus("failed");
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete report.",
      );
    }
  };

  const handleRemoveContent = async () => {
    if (!reportId) return;
    if (!normalizedBaseUrl) {
      setDeleteError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setDeleteStatus("failed");
      return;
    }
    if (!accessToken) {
      setDeleteError("Missing access token.");
      setDeleteStatus("failed");
      return;
    }

    setDeleteStatus("loading");
    setDeleteError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/reports/${reportId}/remove-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to remove content.";
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

      let nextStatus: string | null = null;
      try {
        const body = await response.json();
        nextStatus = body?.data?.status ?? null;
      } catch {
        // Keep current status when response has no body.
      }

      setReport((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus ?? prev.status,
            }
          : prev,
      );
      setDeleteStatus("idle");
      setDeleteOpen(false);
    } catch (err) {
      setDeleteStatus("failed");
      setDeleteError(
        err instanceof Error ? err.message : "Failed to remove content.",
      );
    }
  };

  const handleWarnUser = async () => {
    if (!reportId) return;
    if (!normalizedBaseUrl) {
      setDeleteError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setDeleteStatus("failed");
      return;
    }
    if (!accessToken) {
      setDeleteError("Missing access token.");
      setDeleteStatus("failed");
      return;
    }

    setDeleteStatus("loading");
    setDeleteError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/reports/${reportId}/warn`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to warn user.";
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

      let nextStatus: string | null = null;
      try {
        const body = await response.json();
        nextStatus = body?.data?.status ?? null;
      } catch {
        // Keep current status when response has no body.
      }

      setReport((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus ?? prev.status,
            }
          : prev,
      );
      setDeleteStatus("idle");
      setDeleteOpen(false);
    } catch (err) {
      setDeleteStatus("failed");
      setDeleteError(
        err instanceof Error ? err.message : "Failed to warn user.",
      );
    }
  };

  const handleDismissReport = async () => {
    if (!reportId) return;
    if (!normalizedBaseUrl) {
      setDeleteError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setDeleteStatus("failed");
      return;
    }
    if (!accessToken) {
      setDeleteError("Missing access token.");
      setDeleteStatus("failed");
      return;
    }

    setDeleteStatus("loading");
    setDeleteError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/reports/${reportId}/dismiss`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to dismiss report.";
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

      let nextStatus: string | null = null;
      try {
        const body = await response.json();
        nextStatus = body?.data?.status ?? null;
      } catch {
        // Keep current status when response has no body.
      }

      setReport((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus ?? prev.status,
            }
          : prev,
      );
      setDeleteStatus("idle");
      setDeleteOpen(false);
    } catch (err) {
      setDeleteStatus("failed");
      setDeleteError(
        err instanceof Error ? err.message : "Failed to dismiss report.",
      );
    }
  };

  const contentText = useMemo(() => {
    if (!report?.contentText) return "";
    return report.contentText;
  }, [report]);

  return (
    <div className="space-y-8 w-full">
      {/* TOP SECTION */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Report Details
          </h1>
          <p className="text-gray-500 text-sm max-w-xl">
            This page contain result of the report, so that admin can assess the
            whole thing.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setActionOpen((p) => !p)}
            className="flex items-center gap-2 bg-[#D6F2F8] text-gray-700 hover:bg-[#c9edf5] px-4 py-2 rounded-xl text-sm"
          >
            Action
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                actionOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {actionOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md w-44 z-20">
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteAction("delete");
                  setDeleteOpen(true);
                  setActionOpen(false);
                }}
                className="px-4 py-2 text-sm text-left w-full hover:bg-gray-50 text-red-500"
              >
                Delete Report
              </button>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteAction("remove");
                  setDeleteOpen(true);
                  setActionOpen(false);
                }}
                className="px-4 py-2 text-sm text-left w-full hover:bg-gray-50 text-gray-700"
              >
                Remove Content
              </button>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteAction("warn");
                  setDeleteOpen(true);
                  setActionOpen(false);
                }}
                className="px-4 py-2 text-sm text-left w-full hover:bg-gray-50 text-gray-700"
              >
                Warn User
              </button>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteAction("dismiss");
                  setDeleteOpen(true);
                  setActionOpen(false);
                }}
                className="px-4 py-2 text-sm text-left w-full hover:bg-gray-50 text-gray-700"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {status === "loading" ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600">
          Loading report details...
        </div>
      ) : status === "failed" ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-red-600">
          {error ?? "Failed to load report details."}
        </div>
      ) : report ? (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InfoCard
              title="Report ID"
              value={report.id}
              iconBg="bg-[#F7E3FF]"
              icon={
                <span className="text-lg font-semibold text-[#A855F7]">
                  |||
                </span>
              }
            />

            <InfoCard
              title="Report Count"
              value={report.count}
              iconBg="bg-[#FFE9D2]"
              icon={
                <span className="text-lg font-semibold text-[#D97706]">Nº</span>
              }
            />

            <div className="flex items-center">
              <StatusBadge status={report.status} />
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              {report.contentImage ? (
                <img
                  src={report.contentImage}
                  className="w-full max-w-xl h-auto rounded-xl"
                  alt="Reported content"
                />
              ) : (
                <div className="w-full max-w-xl h-64 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                  No media available
                </div>
              )}

              {contentText ? (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {contentText}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">No text provided.</p>
              )}
            </div>

            {/* REPORTERS LIST */}
            <div className="col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-2">
              <ReporterCard title="Reported User" user={report.user} />

              {report.reasons.map((reason, i) => (
                <ReasonCard key={`${reason}-${i}`} reason={reason} />
              ))}
            </div>
          </div>
        </>
      ) : null}

      {deleteError ? (
        <p className="text-xs text-red-600">{deleteError}</p>
      ) : null}

      {deleteOpen && (
        <ConfirmModal
          open={deleteOpen}
          title={
            deleteAction === "remove"
              ? "Remove Content?"
              : deleteAction === "warn"
                ? "Warn User?"
                : deleteAction === "dismiss"
                  ? "Dismiss Report?"
                  : "Delete Report?"
          }
          description={
            deleteAction === "remove"
              ? "This will remove the reported content and update the report status."
              : deleteAction === "warn"
                ? "A warning will be sent to the user for this reported content."
                : deleteAction === "dismiss"
                  ? "This report will be marked as dismissed."
                  : "Deleting this report will permanently remove it from the database."
          }
          onClose={() => {
            setDeleteOpen(false);
            setDeleteStatus("idle");
          }}
          onConfirm={
            deleteAction === "remove"
              ? handleRemoveContent
              : deleteAction === "warn"
                ? handleWarnUser
                : deleteAction === "dismiss"
                  ? handleDismissReport
                  : handleDeleteReport
          }
          loading={deleteStatus === "loading"}
        />
      )}
    </div>
  );
}
