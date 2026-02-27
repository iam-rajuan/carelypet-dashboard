"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const totalPages = useMemo(() => {
    const pages = Math.ceil(total / limit);
    return pages > 0 ? pages : 1;
  }, [limit, total]);

  const fetchUnreadCount = useCallback(async () => {
    if (!normalizedBaseUrl || !accessToken) return;

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/notifications/unread-count`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to fetch unread count."),
        );
      }

      const body = await response.json();
      const nextCount = body?.data?.unreadCount;
      if (typeof nextCount === "number") {
        setUnreadCount(nextCount);
      }
    } catch {
      // Keep list usable if unread count endpoint fails.
    }
  }, [accessToken, normalizedBaseUrl]);

  const fetchNotifications = useCallback(
    async (options?: { page?: number; filter?: "all" | "unread" }) => {
      const currentPage = options?.page ?? page;
      const currentFilter = options?.filter ?? activeFilter;

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
        `${normalizedBaseUrl}/admin/notifications?page=${currentPage}&limit=${limit}&status=${currentFilter}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to fetch notifications."),
        );
      }

      const body = await response.json();
      const rows = body?.data?.data;
      const pagination = body?.data?.pagination;
      const apiUnreadCount = body?.data?.unreadCount;

      if (!Array.isArray(rows)) {
        throw new Error("Invalid notifications response.");
      }

      setNotifications(
        rows.map((row: ApiNotification, index: number) =>
          mapNotificationRow(row, index),
        ),
      );
      setTotal(typeof pagination?.total === "number" ? pagination.total : 0);
      if (typeof apiUnreadCount === "number") {
        setUnreadCount(apiUnreadCount);
      }
      setStatus("idle");
    } catch (err) {
      setStatus("failed");
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications.",
      );
    }
    },
    [accessToken, activeFilter, limit, normalizedBaseUrl, page],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleMarkAllRead = async () => {
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
    if (unreadCount === 0) return;

    setMarkingAllRead(true);
    setError(null);
    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to mark all as read."),
        );
      }

      const nextPage = activeFilter === "unread" ? 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      }
      await Promise.all([
        fetchNotifications({ page: nextPage, filter: activeFilter }),
        fetchUnreadCount(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark all as read.",
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleOpenNotification = async (notification: NotificationItem) => {
    if (!notification.serverId || notification.isRead) return;
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

    setMarkingReadId(notification.id);
    setError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/notifications/${notification.serverId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Failed to mark notification as read."),
        );
      }

      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read.",
      );
    } finally {
      setMarkingReadId(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">
            Manage all updates related to reports, services, adoptions, and user
            activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-[#C6EEF7] bg-[#EAF9FD] px-3 py-1 text-xs font-semibold text-[#007A92]">
            Unread: {unreadCount}
          </span>
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead || unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00A7C7] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0093AF] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAllRead ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterTab
          active={activeFilter === "all"}
          label="All"
          onClick={() => {
            setPage(1);
            setActiveFilter("all");
          }}
        />
        <FilterTab
          active={activeFilter === "unread"}
          label="Unread"
          onClick={() => {
            setPage(1);
            setActiveFilter("unread");
          }}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          {activeFilter === "all"
            ? "No notifications found."
            : "No unread notifications found."}
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              loading={markingReadId === notification.id}
              onClick={() => handleOpenNotification(notification)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || status === "loading"}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || status === "loading"}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

type ApiNotification = {
  id?: string;
  _id?: string;
  title?: string;
  message?: string;
  description?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  read?: boolean;
  isRead?: boolean;
  status?: string;
};

type NotificationItem = {
  id: string;
  serverId: string | null;
  title: string;
  description: string;
  timeText: string;
  isRead: boolean;
};

function FilterTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#00A7C7] text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function NotificationCard({
  notification,
  loading,
  onClick,
}: {
  notification: NotificationItem;
  loading: boolean;
  onClick: () => void;
}) {
  const canMarkAsRead = Boolean(notification.serverId) && !notification.isRead;

  return (
    <button
      onClick={onClick}
      disabled={!canMarkAsRead || loading}
      className={`w-full rounded-2xl border p-5 shadow-sm text-left transition ${
        notification.isRead
          ? "border-gray-200 bg-white"
          : "border-[#BCECF6] bg-[#F4FCFE] hover:bg-[#EAF9FD]"
      } ${!canMarkAsRead || loading ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-[#D6F2F8] p-3">
          <Bell className="h-6 w-6 text-[#00A7C7]" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-gray-900">
              {notification.title}
            </h3>
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                notification.isRead
                  ? "bg-gray-100 text-gray-500"
                  : "bg-[#D6F2F8] text-[#007A92]"
              }`}
            >
              {notification.isRead ? "Read" : "Unread"}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-600">{notification.description}</p>
          <p className="mt-2 text-xs text-gray-400">
            {loading ? "Marking as read..." : notification.timeText}
          </p>
        </div>
      </div>
    </button>
  );
}

function mapNotificationRow(row: ApiNotification, index: number): NotificationItem {
  const serverId =
    typeof row.id === "string"
      ? row.id
      : typeof row._id === "string"
        ? row._id
        : null;

  return {
    id: serverId ?? `notification-${index}`,
    serverId,
    title: row.title?.trim() || "Notification",
    description: row.message?.trim() || row.description?.trim() || "-",
    timeText: formatRelativeTime(row.createdAt ?? row.updatedAt),
    isRead: getReadState(row),
  };
}

function getReadState(row: ApiNotification) {
  if (typeof row.isRead === "boolean") return row.isRead;
  if (typeof row.read === "boolean") return row.read;
  return row.status === "read";
}

function formatRelativeTime(input?: string) {
  if (!input) return "Unknown time";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(minutes);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMinutes < 60) return rtf.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  const absHours = Math.abs(hours);
  if (absHours < 24) return rtf.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, "day");

  return date.toLocaleString();
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const errorBody = await response.json();
    const message = errorBody?.message;
    if (typeof message === "string" && message.trim()) return message;
  } catch {
    // Try text fallback when JSON body is unavailable.
  }

  try {
    const text = await response.text();
    if (text.trim()) return text;
  } catch {
    // Keep default fallback.
  }

  return fallback;
}
