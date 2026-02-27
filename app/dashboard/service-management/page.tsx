"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import ConfirmModal from "../report/ConfirmModal";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../store/hooks";

interface ServiceRequest {
  id: string;
  customerName: string;
  serviceType: string;
  petType: string;
  petBreed: string;
  petAge: string;
  status: "pending" | "completed" | string;
}

export default function ServiceManagementPage() {
  const router = useRouter();

  const [data, setData] = useState<ServiceRequest[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  type StatusFilter = "All" | "Pending" | "Completed";
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [openStatusMenu, setOpenStatusMenu] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  useEffect(() => {
    const fetchServices = async () => {
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

      const statusParam = selectedStatus.toLowerCase();
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(
          `${normalizedBaseUrl}/admin/services?status=${statusParam}&page=${page}&limit=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to fetch services.";
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
        const items = body?.data?.data;
        const pagination = body?.data?.pagination;
        if (!Array.isArray(items)) {
          throw new Error("Invalid services response.");
        }

        setData(
          items.map((item: ServiceRequest & { petAgeLabel?: string }) => ({
            id: item.id ?? "",
            customerName: item.customerName ?? "Unknown",
            serviceType: item.serviceType ?? "-",
            petType: item.petType ?? "-",
            petBreed: item.petBreed ?? "-",
            petAge: item.petAgeLabel ?? `${item.petAge ?? ""}`.trim(),
            status: item.status ?? "pending",
          })),
        );
        setTotal(typeof pagination?.total === "number" ? pagination.total : 0);
        setStatus("idle");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch services.",
        );
        setStatus("failed");
      }
    };

    fetchServices();
  }, [accessToken, normalizedBaseUrl, page, pageSize, selectedStatus]);

  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  const filteredData = useMemo(() => data, [data]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (openStatusMenu && !target.closest('[data-menu-root="status"]')) {
        setOpenStatusMenu(false);
      }

      if (
        openActionMenuId &&
        !target.closest('[data-menu-root="row-action"]')
      ) {
        setOpenActionMenuId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openActionMenuId, openStatusMenu]);

  // ------------------------
  // Actions
  // ------------------------

  const updateStatus = async (
    id: string,
    nextStatus: "pending" | "completed",
  ) => {
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

    const previous = data;
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    setOpenActionMenuId(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/services/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      if (!response.ok) {
        let message = "Failed to update service status.";
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
    } catch (err) {
      setData(previous);
      setError(
        err instanceof Error ? err.message : "Failed to update service status.",
      );
      setStatus("failed");
    }
  };

  const deleteEntry = async () => {
    if (deleteTarget === null) return;
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

    const targetId = deleteTarget;
    const previous = data;
    setData((prev) => prev.filter((item) => item.id !== targetId));
    setDeleteTarget(null);
    setOpenActionMenuId(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/services/${targetId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to delete service.";
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
    } catch (err) {
      setData(previous);
      setError(
        err instanceof Error ? err.message : "Failed to delete service.",
      );
      setStatus("failed");
    }
  };

  return (
    <div className="p-6">
      {/* TITLE */}
      <h1 className="text-2xl font-semibold text-gray-900">
        Service Management
      </h1>
      <p className="text-gray-600 text-sm mt-1">
        This section will show which customers request for service.
      </p>

      {/* STATUS FILTER */}
      <div className="flex justify-end mt-5">
        <div className="relative" data-menu-root="status">
          <button
            onClick={() => setOpenStatusMenu((prev) => !prev)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl bg-white shadow-sm text-gray-800"
          >
            Status
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {openStatusMenu && (
            <div className="absolute right-0 mt-2 bg-white shadow-md rounded-xl w-40 border border-gray-200 z-20">
              {["All", "Pending", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status as StatusFilter);
                    setOpenStatusMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4 text-left">NO.</th>
              <th className="p-4 text-left">Customer name</th>
              <th className="p-4 text-left">Service Type</th>
              <th className="p-4 text-left">Pet Type</th>
              <th className="p-4 text-left">Pet Breed</th>
              <th className="p-4 text-left">Pet Age</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {status === "loading" ? (
              <tr className="border-t border-gray-200">
                <td colSpan={8} className="p-6 text-center text-gray-600">
                  Loading services...
                </td>
              </tr>
            ) : status === "failed" ? (
              <tr className="border-t border-gray-200">
                <td colSpan={8} className="p-6 text-center text-red-600">
                  {error ?? "Failed to load services."}
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={8} className="p-6 text-center text-gray-600">
                  No services found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => {
                const statusValue = item.status?.toLowerCase();
                return (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="p-4 text-gray-700">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="p-4 text-gray-800">{item.customerName}</td>
                    <td className="p-4 text-gray-700">{item.serviceType}</td>
                    <td className="p-4 text-gray-700">{item.petType}</td>
                    <td className="p-4 text-gray-700">{item.petBreed}</td>
                    <td className="p-4 text-gray-700">{item.petAge}</td>

                    {/* STATUS BADGE */}
                    <td className="p-4">
                      {statusValue === "completed" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center w-fit gap-2">
                          Completed{" "}
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center w-fit gap-2">
                          Pending{" "}
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        </span>
                      )}
                    </td>

                    {/* ACTION MENU */}
                    <td className="p-4">
                      <div className="relative" data-menu-root="row-action">
                        <button
                          onClick={() =>
                            setOpenActionMenuId(
                              openActionMenuId === item.id ? null : item.id,
                            )
                          }
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-700" />
                        </button>

                        {openActionMenuId === item.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl z-30">
                            <button
                              onClick={() => {
                                setOpenActionMenuId(null);
                                router.push(
                                  `/dashboard/service-management/${item.id}`,
                                );
                              }}
                              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                            >
                              View
                            </button>

                            <button
                              onClick={() => setDeleteTarget(item.id)}
                              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>

                            <div className="border-t border-gray-200 my-1"></div>

                            <p className="px-4 pt-1 text-xs text-gray-500">
                              ACTION
                            </p>

                            <button
                              onClick={() => updateStatus(item.id, "completed")}
                              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                            >
                              Completed
                            </button>

                            <button
                              onClick={() => updateStatus(item.id, "pending")}
                              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                            >
                              Not Completed
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <p className="text-gray-600 text-sm mt-4">
        No of Results {filteredData.length} out of {total}
      </p>

      {/* PAGINATION */}
      <div className="flex items-center gap-2 mt-4">
        <button
          className="border border-gray-400 px-2 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          &lt;
        </button>
        <button className="border border-gray-200 px-2 py-1 rounded-lg bg-gray-900 text-white">
          {page}
        </button>
        <button
          className="border border-gray-400 px-2 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            setPage((prev) =>
              Math.min(prev + 1, Math.max(1, Math.ceil(total / pageSize))),
            )
          }
          disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
        >
          &gt;
        </button>
      </div>

      {/* DELETE MODAL */}
      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteEntry}
      />
    </div>
  );
}
