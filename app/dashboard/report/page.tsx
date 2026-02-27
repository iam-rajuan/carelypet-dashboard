"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import ActionMenu from "./ActionMenu";
import { useAppSelector } from "../../store/hooks";

type ActionType = "delete" | "remove" | "warn" | "dismiss";

interface SelectedReportState {
  type: ActionType;
  id: string;
}

type ReportItem = {
  id: string;
  postId: string;
  reportedUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  count: number;
  status: string;
  reasons: string[];
  createdAt: string;
  updatedAt: string;
};

export default function ReportPage() {
  const [statusFilter, setStatusFilter] = useState("Status");
  const [filterOpen, setFilterOpen] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<SelectedReportState | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const handleDeleteClick = (type: ActionType, id: string) => {
    setDeleteError(null);
    setSelectedReport({ type, id });
    setModalOpen(true);
  };

  const modalTexts = {
    delete: {
      title: "Are you sure you want to delete this report?",
      desc: "Deleting this report will permanently remove it from the database.",
    },
    remove: {
      title: "Are you sure you want to remove this content?",
      desc: "The content will no longer be visible to users after removal.",
    },
    warn: {
      title: "Warn this user?",
      desc: "A warning will be sent to the user for this reported content.",
    },
    dismiss: {
      title: "Dismiss this report?",
      desc: "This report will be marked as dismissed.",
    },
  };

  useEffect(() => {
    const fetchReports = async () => {
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
        const response = await fetch(`${normalizedBaseUrl}/admin/reports`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          let message = "Failed to fetch reports.";
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
        const items = data?.data;
        if (!Array.isArray(items)) {
          throw new Error("Invalid reports response.");
        }

        setReports(items);
        setStatus("idle");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch reports.",
        );
        setStatus("failed");
      }
    };

    fetchReports();
  }, [accessToken, normalizedBaseUrl]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredReports = useMemo(() => {
    if (statusFilter === "Status" || statusFilter === "All") {
      return reports;
    }
    const normalizedFilter = statusFilter.toLowerCase();
    return reports.filter(
      (report) => report.status?.toLowerCase() === normalizedFilter,
    );
  }, [reports, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredReports.slice(start, end);
  }, [filteredReports, currentPage, pageSize]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const handleConfirmAction = async () => {
    if (!selectedReport) return;
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
      const isRemove = selectedReport.type === "remove";
      const isWarn = selectedReport.type === "warn";
      const isDismiss = selectedReport.type === "dismiss";
      const endpoint = isRemove
        ? `${normalizedBaseUrl}/admin/reports/${selectedReport.id}/remove-content`
        : isWarn
          ? `${normalizedBaseUrl}/admin/reports/${selectedReport.id}/warn`
          : isDismiss
            ? `${normalizedBaseUrl}/admin/reports/${selectedReport.id}/dismiss`
            : `${normalizedBaseUrl}/admin/reports/${selectedReport.id}`;
      const method = isRemove || isWarn || isDismiss ? "POST" : "DELETE";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        let message = isRemove
          ? "Failed to remove content."
          : isWarn
            ? "Failed to warn user."
            : isDismiss
              ? "Failed to dismiss report."
              : "Failed to delete report.";
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

      if (isRemove || isWarn || isDismiss) {
        let nextStatus: string | null = null;
        try {
          const body = await response.json();
          nextStatus = body?.data?.status ?? null;
        } catch {
          // Keep existing status when response has no body.
        }
        setReports((prev) =>
          prev.map((report) =>
            report.id === selectedReport.id
              ? { ...report, status: nextStatus ?? report.status }
              : report,
          ),
        );
      } else {
        setReports((prev) =>
          prev.filter((report) => report.id !== selectedReport.id),
        );
      }
      setDeleteStatus("idle");
      setModalOpen(false);
      setSelectedReport(null);
    } catch (err) {
      setDeleteStatus("failed");
      setDeleteError(
        err instanceof Error ? err.message : "Failed to complete action.",
      );
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Report Table</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Identify regulatory violations and take appropriate actions in
            accordance with legal and ethical standards.
          </p>
        </div>

        {/* STATUS DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 bg-[#D6F2F8] hover:bg-[#c9edf5] text-gray-700 px-4 py-2 rounded-xl text-sm"
          >
            {statusFilter}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                filterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md z-30 w-40">
              {["All", "Resolved", "Dismissed", "Pending"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setStatusFilter(item);
                    setFilterOpen(false);
                  }}
                  className="px-4 py-2 text-sm text-left text-gray-600 w-full hover:bg-gray-50"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-visible relative">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Report ID
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Reported User
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Report Count
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Reported User @username
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {status === "loading" ? (
              <tr className="border-t border-gray-200">
                <td className="py-6 px-5 text-center text-gray-600" colSpan={6}>
                  Loading reports...
                </td>
              </tr>
            ) : status === "failed" ? (
              <tr className="border-t border-gray-200">
                <td className="py-6 px-5 text-center text-red-600" colSpan={6}>
                  {error ?? "Failed to load reports."}
                </td>
              </tr>
            ) : pagedReports.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td className="py-6 px-5 text-center text-gray-600" colSpan={6}>
                  No reports found.
                </td>
              </tr>
            ) : (
              pagedReports.map((item) => {
                const statusValue = item.status?.toLowerCase();
                const displayStatus =
                  statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
                return (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="py-4 px-5 text-gray-800">{item.id}</td>
                    <td className="py-4 px-5 text-gray-900">
                      {item.reportedUser?.name ?? "Unknown"}
                    </td>
                    <td className="py-4 px-5 text-gray-700">{item.count}</td>
                    <td className="py-4 px-5 text-gray-700">
                      {item.reportedUser?.username
                        ? `@${item.reportedUser.username}`
                        : "-"}
                    </td>

                    {/* STATUS BADGE */}
                    <td className="py-4 px-5">
                      {statusValue === "resolved" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1 w-fit">
                          Resolved
                          <span className="h-2 w-2 bg-green-500 rounded-full" />
                        </span>
                      ) : statusValue === "dismissed" ? (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1 w-fit">
                          Dismissed
                          <span className="h-2 w-2 bg-gray-400 rounded-full" />
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1 w-fit">
                          {displayStatus || "Pending"}
                          <span className="h-2 w-2 bg-yellow-500 rounded-full" />
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <ActionMenu
                        reportId={item.id}
                        onDeleteClick={handleDeleteClick}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER SUMMARY */}
      <p className="text-sm text-gray-600">
        No of Results {filteredReports.length} out of {reports.length}
      </p>

      {deleteError ? (
        <p className="text-xs text-red-600">{deleteError}</p>
      ) : null}

      {/* PAGINATION */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`px-4 py-2 border border-gray-200 rounded-lg ${
              number === currentPage
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setPage(number)}
          >
            {number}
          </button>
        ))}

        <button
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </button>
      </div>
      {modalOpen && selectedReport && (
        <ConfirmModal
          open={modalOpen}
          title={modalTexts[selectedReport.type].title}
          description={modalTexts[selectedReport.type].desc}
          onClose={() => {
            setModalOpen(false);
            setDeleteStatus("idle");
          }}
          onConfirm={handleConfirmAction}
          loading={deleteStatus === "loading"}
        />
      )}
    </div>
  );
}
