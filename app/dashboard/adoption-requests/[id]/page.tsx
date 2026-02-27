"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import {
  fetchAdoptionRequestDetail,
  updateAdoptionRequestStatus,
} from "../../../store/adoptionRequestsSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  delivered: "bg-green-100 text-green-700",
  not_delivered: "bg-red-100 text-red-700",
};

export default function AdoptionRequestDetailPage() {
  const params = useParams();
  const requestId = params?.id as string | undefined;
  const dispatch = useAppDispatch();
  const detail = useAppSelector((state) => state.adoptionRequests.detail);
  const status = useAppSelector((state) => state.adoptionRequests.detailStatus);
  const error = useAppSelector((state) => state.adoptionRequests.detailError);
  const updateStatus = useAppSelector(
    (state) => state.adoptionRequests.updateStatus,
  );
  const updateError = useAppSelector(
    (state) => state.adoptionRequests.updateError,
  );
  const [actionOpen, setActionOpen] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    dispatch(fetchAdoptionRequestDetail({ id: requestId }));
  }, [dispatch, requestId]);

  const listing = detail?.listing;
  const customer = detail?.customer;

  const displayStatus = useMemo(() => {
    const raw = detail?.status ?? "";
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Unknown";
  }, [detail?.status]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Adoption Request Details
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            View full information for this adoption request.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {detail?.status && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusStyles[detail.status.toLowerCase()] ??
                "bg-gray-100 text-gray-600"
              }`}
            >
              {displayStatus}
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setActionOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Request actions"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-700" />
            </button>
            {actionOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl border border-gray-200 z-20">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-800"
                  disabled={updateStatus === "loading" || !requestId}
                  onClick={async () => {
                    if (!requestId) return;
                    setActionOpen(false);
                    await dispatch(
                      updateAdoptionRequestStatus({
                        id: requestId,
                        status: "delivered",
                      }),
                    );
                    dispatch(fetchAdoptionRequestDetail({ id: requestId }));
                  }}
                >
                  Delivered
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-800"
                  disabled={updateStatus === "loading" || !requestId}
                  onClick={async () => {
                    if (!requestId) return;
                    setActionOpen(false);
                    await dispatch(
                      updateAdoptionRequestStatus({
                        id: requestId,
                        status: "not_delivered",
                      }),
                    );
                    dispatch(fetchAdoptionRequestDetail({ id: requestId }));
                  }}
                >
                  Not Delivered
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {updateStatus === "failed" && updateError ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-red-600">
          {updateError}
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
          Loading request details...
        </div>
      ) : status === "failed" ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-red-600">
          {error ?? "Failed to load request details."}
        </div>
      ) : !detail ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
          No request details found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Request Summary
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Request ID</p>
                  <p className="font-medium text-gray-900">{detail.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">{detail.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(detail.orderDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Listing Status</p>
                  <p className="font-medium text-gray-900">
                    {listing?.status ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">
                    {customer?.name?.trim() ? customer.name : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {customer?.phone?.trim() ? customer.phone : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {customer?.address?.trim() ? customer.address : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Listing Details
            </h2>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                {listing?.avatarUrl ? (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200">
                    <Image
                      src={listing.avatarUrl}
                      alt={listing.petName ?? "Pet avatar"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                    No photo
                  </div>
                )}
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Pet Name</p>
                  <p className="font-medium text-gray-900">
                    {listing?.petName ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pet Type</p>
                  <p className="font-medium text-gray-900">
                    {listing?.petType ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pet Breed</p>
                  <p className="font-medium text-gray-900">
                    {listing?.petBreed ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pet Age</p>
                  <p className="font-medium text-gray-900">
                    {listing?.petAge ?? "N/A"}{" "}
                    {typeof listing?.petAge === "number"
                      ? listing.petAge === 1
                        ? "year"
                        : "years"
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">
                    {listing?.petGender ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Listing ID</p>
                  <p className="font-medium text-gray-900">
                    {listing?.id ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
