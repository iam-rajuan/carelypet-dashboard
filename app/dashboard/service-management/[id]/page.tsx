"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Calendar,
  PawPrint,
  User,
  BriefcaseMedical,
} from "lucide-react";
import ConfirmModal from "../../report/ConfirmModal";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "../../../store/hooks";

export default function ViewServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceRequestId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [openMenu, setOpenMenu] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<
    "pending" | "completed" | string
  >("pending");
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<{
    customer: { name: string; phone: string };
    service: {
      serviceName: string;
      dateTime: string;
      providerName: string;
      status: string;
    };
    pet: {
      name: string;
      type: string;
      breed: string;
      ageLabel: string;
    };
    orderSummary: {
      serviceName: string;
      petName: string;
      servicePrice: number;
      items: { serviceName: string; petName: string; price: number }[];
    };
    payment: {
      subtotal: number;
      taxPercent: number;
      total: number;
      status: string;
    };
  } | null>(null);

  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (openMenu && !target.closest('[data-menu-root="service-action"]')) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openMenu]);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceRequestId) return;
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
          `${normalizedBaseUrl}/admin/services/${serviceRequestId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to fetch service.";
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
        if (!payload) {
          throw new Error("Invalid service response.");
        }

        setServiceData({
          customer: {
            name: payload?.customer?.name ?? "Unknown",
            phone: payload?.customer?.phone ?? "-",
          },
          service: {
            serviceName: payload?.service?.serviceName ?? "-",
            dateTime: payload?.service?.dateTime ?? "",
            providerName: payload?.service?.providerName ?? "-",
            status: payload?.service?.status ?? "pending",
          },
          pet: {
            name: payload?.pet?.name ?? "-",
            type: payload?.pet?.type ?? "-",
            breed: payload?.pet?.breed ?? "-",
            ageLabel: payload?.pet?.ageLabel ?? "-",
          },
          orderSummary: {
            serviceName: payload?.orderSummary?.serviceName ?? "-",
            petName: payload?.orderSummary?.petName ?? "-",
            servicePrice: Number(payload?.orderSummary?.servicePrice ?? 0),
            items: Array.isArray(payload?.orderSummary?.items)
              ? payload.orderSummary.items.map(
                  (item: {
                    serviceName?: string;
                    petName?: string;
                    price?: number;
                  }) => ({
                    serviceName: item?.serviceName ?? "-",
                    petName: item?.petName ?? "-",
                    price: Number(item?.price ?? 0),
                  }),
                )
              : [],
          },
          payment: {
            subtotal: Number(payload?.payment?.subtotal ?? 0),
            taxPercent: Number(payload?.payment?.taxPercent ?? 0),
            total: Number(payload?.payment?.total ?? 0),
            status: payload?.payment?.status ?? "unpaid",
          },
        });

        setServiceStatus(payload?.service?.status ?? "pending");
        setStatus("idle");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch service.",
        );
        setStatus("failed");
      }
    };

    fetchService();
  }, [accessToken, normalizedBaseUrl, serviceRequestId]);

  const formattedDateTime = useMemo(() => {
    if (!serviceData?.service?.dateTime) return "-";
    const date = new Date(serviceData.service.dateTime);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  }, [serviceData?.service?.dateTime]);

  const formatMoney = (value: number) =>
    `$ ${Number.isFinite(value) ? value.toFixed(2) : "0.00"}`;

  const isCompleted = serviceStatus?.toLowerCase() === "completed";

  const updateServiceStatus = async (nextStatus: "pending" | "completed") => {
    if (!serviceRequestId) return;
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

    const previousStatus = serviceStatus;
    setServiceStatus(nextStatus);
    setOpenMenu(false);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/services/${serviceRequestId}/status`,
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
      setServiceStatus(previousStatus);
      setError(
        err instanceof Error ? err.message : "Failed to update service status.",
      );
      setStatus("failed");
    }
  };

  const deleteService = async () => {
    if (!serviceRequestId) return;
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

    setDeleteOpen(false);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/services/${serviceRequestId}`,
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

      router.push("/dashboard/service-management");
    } catch (err) {
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
        This section will show details of that service the customer has booked.
      </p>

      {/* ACTION BUTTON */}
      <div
        className="flex justify-end mt-4 relative"
        data-menu-root="service-action"
      >
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl bg-white shadow-sm text-gray-800"
        >
          Action
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl z-20">
            <button
              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={() => setOpenMenu(false)}
            >
              View
            </button>

            <button
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              onClick={() => {
                setDeleteOpen(true);
                setOpenMenu(false);
              }}
            >
              Delete
            </button>

            <div className="border-t border-gray-200 my-1" />

            <p className="px-4 pt-1 text-xs text-gray-500">ACTION</p>

            <button
              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={() => updateServiceStatus("completed")}
            >
              Completed
            </button>

            <button
              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={() => updateServiceStatus("pending")}
            >
              Not Completed
            </button>
          </div>
        )}
      </div>

      {status === "loading" ? (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-sm text-gray-600">
          Loading service details...
        </div>
      ) : status === "failed" ? (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-sm text-red-600">
          {error ?? "Failed to load service details."}
        </div>
      ) : (
        <>
          {/* CUSTOMER INFORMATION */}
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-semibold text-gray-900">
                Customer Information
              </h2>

              {isCompleted ? (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs flex items-center gap-2">
                  Completed{" "}
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center gap-2">
                  Pending{" "}
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="text-gray-800 font-medium">
                  {serviceData?.customer.name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="text-gray-800 font-medium">
                  {serviceData?.customer.phone ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* SERVICE DETAILS */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* SERVICE */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BriefcaseMedical className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Service</p>
                  <p className="text-gray-800 font-medium">
                    {serviceData?.service.serviceName ?? "-"}
                  </p>
                </div>
              </div>

              {/* DATE & TIME */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Date & Time</p>
                  <p className="text-gray-800 font-medium">
                    {formattedDateTime}
                  </p>
                </div>
              </div>

              {/* WITH */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">With</p>
                  <p className="text-gray-800 font-medium">
                    {serviceData?.service.providerName || "Carely Pets"}
                  </p>
                </div>
              </div>

              {/* FOR */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">For</p>
                  <p className="text-gray-800 font-medium">
                    {serviceData?.pet.name ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>

            {(serviceData?.orderSummary.items ?? []).length > 0 ? (
              serviceData?.orderSummary.items.map((item, index) => (
                <div
                  key={`${item.serviceName}-${index}`}
                  className="flex justify-between text-sm mb-2"
                >
                  <div>
                    <p className="text-gray-800 font-medium">
                      {item.serviceName}
                    </p>
                    <p className="text-gray-600">{item.petName}</p>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {formatMoney(item.price)}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-sm mb-2">
                <div>
                  <p className="text-gray-800 font-medium">
                    {serviceData?.orderSummary.serviceName ?? "-"}
                  </p>
                  <p className="text-gray-600">
                    {serviceData?.orderSummary.petName ?? "-"}
                  </p>
                </div>
                <p className="text-gray-800 font-medium">
                  {formatMoney(serviceData?.orderSummary.servicePrice ?? 0)}
                </p>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <p className="text-gray-700">Subtotal</p>
              <p className="text-gray-800 font-medium">
                {formatMoney(serviceData?.payment.subtotal ?? 0)}
              </p>
            </div>

            <div className="flex justify-between text-sm mt-1">
              <p className="text-gray-700">Tax</p>
              <p className="text-gray-800 font-medium">
                ({serviceData?.payment.taxPercent ?? 0}%)
                {` ${formatMoney(
                  ((serviceData?.payment.subtotal ?? 0) *
                    (serviceData?.payment.taxPercent ?? 0)) /
                    100,
                )}`}
              </p>
            </div>

            <div className="flex justify-between text-base font-semibold text-gray-900 mt-4 pt-3 border-t border-gray-400">
              <p>Total</p>
              <p>{formatMoney(serviceData?.payment.total ?? 0)}</p>
            </div>
          </div>

          {/* PAYMENT STATUS */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center text-gray-800 font-medium flex justify-center items-center gap-2">
            {serviceData?.payment.status ?? "unpaid"}
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                serviceData?.payment.status === "paid"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            >
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          </div>
        </>
      )}

      {/* DELETE MODAL */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteService}
      />
    </div>
  );
}
