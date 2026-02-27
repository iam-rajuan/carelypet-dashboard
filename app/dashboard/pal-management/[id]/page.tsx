"use client";

import { useEffect, useMemo, useState } from "react";
import { User, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "../../../store/hooks";

// ---- TAB LIST ----
const tabs = ["Profile", "Pets", "Service"];

export default function PetOwnerDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Profile");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<UserPet[]>([]);
  const [services, setServices] = useState<UserService[]>([]);

  interface UserProfile {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    status?: string | null;
    reportCount?: number | null;
    reportOnPostCount?: number | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    joiningDate?: string | null;
    deletionRequestedAt?: string | null;
    deletionDaysLeft?: number | null;
  }

  interface UserPet {
    id: string;
    status?: string | null;
    name: string;
    age: number;
    memoryStart?: string | null;
    type: string;
    gender?: string | null;
    breed?: string | null;
    trained?: boolean | null;
    neutered?: boolean | null;
    vaccinated?: boolean | null;
    avatarUrl?: string | null;
    photos?: string[] | null;
  }

  interface UserService {
    id: string;
    customer?: {
      name?: string | null;
      phone?: string | null;
    } | null;
    service?: {
      serviceName?: string | null;
      dateTime?: string | null;
      providerName?: string | null;
      status?: string | null;
    } | null;
    pet?: {
      name?: string | null;
      type?: string | null;
      breed?: string | null;
      age?: number | null;
      ageLabel?: string | null;
    } | null;
    orderSummary?: {
      serviceName?: string | null;
      petName?: string | null;
      servicePrice?: number | null;
      items?: Array<{
        serviceName?: string | null;
        petName?: string | null;
        price?: number | null;
      }> | null;
    } | null;
    payment?: {
      subtotal?: number | null;
      taxPercent?: number | null;
      total?: number | null;
      status?: string | null;
    } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }

  useEffect(() => {
    if (!id) return;
    if (!normalizedBaseUrl) {
      setStatus("failed");
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }
    if (!accessToken) {
      setStatus("failed");
      setError("Missing access token.");
      return;
    }

    const controller = new AbortController();
    const fetchProfile = async () => {
      setStatus("loading");
      setError(null);
      try {
        const response = await fetch(
          `${normalizedBaseUrl}/admin/users/${id}/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          let message = "Failed to load user profile.";
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
        setProfile(body?.data?.profile ?? null);
        setPets(Array.isArray(body?.data?.pets) ? body.data.pets : []);
        setServices(
          Array.isArray(body?.data?.services) ? body.data.services : [],
        );
        setStatus("idle");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("failed");
        setError(
          err instanceof Error ? err.message : "Failed to load user profile.",
        );
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [accessToken, id, normalizedBaseUrl]);

  const displayJoinDate = useMemo(() => {
    if (!profile?.joiningDate) return "N/A";
    return new Date(profile.joiningDate).toLocaleDateString();
  }, [profile?.joiningDate]);

  const deletionLabel = useMemo(() => {
    if (!profile?.deletionRequestedAt) return "N/A";
    if (typeof profile?.deletionDaysLeft === "number") {
      return `${profile.deletionDaysLeft} days left`;
    }
    return "Requested";
  }, [profile?.deletionDaysLeft, profile?.deletionRequestedAt]);

  return (
    <div className="w-full space-y-10">
      {/* ---- HEADER ---- */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Detail of Pet Owner {id}
          </h1>
          <p className="text-sm text-gray-500">
            This section will show every details of a particular user.
          </p>
        </div>
      </div>

      {/* ---- TABS ---- */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 text-lg font-medium transition ${
                activeTab === t
                  ? "text-[#00A7C7] border-b-2 border-[#00A7C7]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ---- PROFILE TAB ---- */}
      {activeTab === "Profile" && (
        <div className="space-y-10">
          {status === "loading" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
              Loading profile...
            </div>
          ) : status === "failed" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-red-600">
              {error ?? "Failed to load profile."}
            </div>
          ) : !profile ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
              No profile data found.
            </div>
          ) : (
            <>
              {/* USER HEADER */}
              <div className="flex items-center gap-6">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    width={90}
                    height={90}
                    className="rounded-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <User className="h-8 w-8" />
                  </div>
                )}

                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center w-fit gap-2">
                    {profile.status ?? "N/A"}
                    <span className="h-2 w-2 bg-green-600 rounded-full" />
                  </span>

                  <h2 className="text-xl text-gray-800 mt-2">
                    {profile.name ?? "N/A"}
                  </h2>
                  <p className="text-gray-600">
                    {profile.username ? `@${profile.username}` : "N/A"}
                  </p>
                </div>
              </div>

              {/* REPORT SUMMARY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* REPORT COUNT */}
                <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">
                      REPORT COUNT
                    </p>
                    <p className="text-2xl text-gray-800 font-bold mt-1">
                      {profile.reportCount ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    №
                  </div>
                </div>

                {/* REPORT ON POST */}
                <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">
                      REPORT ON POST
                    </p>
                    <p className="text-2xl text-gray-800 font-bold mt-1">
                      {profile.reportOnPostCount ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                    !
                  </div>
                </div>
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <p className="text-xs text-gray-500">EMAIL</p>
                  <p className="text-gray-800 font-medium border-b pb-2 mt-1">
                    {profile.email ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">PHONE</p>
                  <p className="text-gray-800 font-medium border-b pb-2 mt-1">
                    {profile.phone ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">ADDRESS</p>
                  <p className="text-gray-800 font-medium border-b pb-2 mt-1">
                    {profile.address ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">COUNTRY</p>
                  <p className="text-gray-800 font-medium border-b pb-2 mt-1">
                    {profile.country ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">JOINING DATE</p>
                  <p className="text-gray-800 font-medium border-b pb-2 mt-1">
                    {displayJoinDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    DELETION (30 days timeline)
                  </p>
                  <p className="text-red-500 font-medium border-b pb-2 mt-1">
                    {deletionLabel}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- PETS TAB ---- */}
      {activeTab === "Pets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {status === "loading" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
              Loading pets...
            </div>
          ) : status === "failed" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-red-600">
              {error ?? "Failed to load pets."}
            </div>
          ) : pets.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
              No pets found.
            </div>
          ) : (
            pets.map((p) => (
              <div
                key={p.id}
                className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
              >
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    className="w-full h-52 object-cover"
                    alt={p.name}
                  />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400">
                    <User className="h-8 w-8" />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800">
                      {p.name} {p.id}
                    </p>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        p.gender?.toLowerCase() === "female"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {p.gender ?? "N/A"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800">
                    {p.type} • {p.age} year{p.age === 1 ? "" : "s"}
                  </p>

                  <Link
                    href={`/dashboard/pal-management/${id}/pet/${p.id}`}
                    className="block w-full text-center mt-3 py-2 rounded-lg bg-[#D6F2F8] hover:bg-[#c9edf5] text-gray-800 font-medium"
                  >
                    Pet Facts
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- SERVICE TAB ---- */}
      {activeTab === "Service" && (
        <div className="space-y-4">
          {status === "loading" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
              Loading services...
            </div>
          ) : status === "failed" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-red-600">
              {error ?? "Failed to load services."}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
              No services found.
            </div>
          ) : (
            services.map((s) => {
              const isOpen = openAccordion === s.id;
              const serviceName = s.service?.serviceName ?? "N/A";
              const serviceDate = s.service?.dateTime
                ? new Date(s.service.dateTime).toLocaleString()
                : "N/A";
              const providerName = s.service?.providerName ?? "N/A";
              const serviceStatus = s.service?.status ?? "N/A";
              const paymentStatus = s.payment?.status ?? "N/A";
              const statusLabel = serviceStatus.toString().toUpperCase();
              const isPending = serviceStatus?.toLowerCase() === "pending";
              const displayTotal =
                typeof s.payment?.total === "number"
                  ? `$${s.payment.total.toFixed(2)}`
                  : "N/A";
              const displaySubtotal =
                typeof s.payment?.subtotal === "number"
                  ? `$${s.payment.subtotal.toFixed(2)}`
                  : "N/A";
              const taxPercent =
                typeof s.payment?.taxPercent === "number"
                  ? s.payment.taxPercent
                  : 0;
              const taxAmount =
                typeof s.payment?.subtotal === "number"
                  ? (s.payment.subtotal * taxPercent) / 100
                  : 0;

              return (
                <div
                  key={s.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : s.id)}
                    className="w-full flex justify-between items-center px-5 py-4 text-left"
                  >
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        {serviceName}
                      </p>
                      <p className="text-lg text-gray-800 font-semibold">
                        {displayTotal}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
                          isPending
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {statusLabel}
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isPending ? "bg-yellow-500" : "bg-green-500"
                          }`}
                        />
                      </span>

                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <div
                    className={`transition-all duration-300 ${
                      isOpen ? "max-h-[2000px] py-6" : "max-h-0"
                    } overflow-hidden px-5`}
                  >
                    {/* SERVICE ID */}
                    <div className="mb-5">
                      <p className="text-xs text-gray-500 font-semibold">
                        SERVICE ID
                      </p>
                      <p className="text-gray-800 font-medium">{s.id}</p>
                    </div>

                    {/* CUSTOMER INFO */}
                    <div className="p-5 border border-gray-200 rounded-xl mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-800 font-semibold">
                          Customer Information
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
                            isPending
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {statusLabel}
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isPending ? "bg-yellow-500" : "bg-green-500"
                            }`}
                          />
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            NAME
                          </p>
                          <p className="text-gray-800 font-medium">
                            {s.customer?.name ?? "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            PHONE
                          </p>
                          <p className="text-gray-800 font-medium">
                            {s.customer?.phone ?? "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SERVICE DETAILS */}
                    <div className="p-5 border border-gray-200 rounded-xl mb-6 space-y-5">
                      <DetailRow
                        label="SERVICE"
                        value={serviceName}
                        icon="/icons/service.svg"
                      />
                      <DetailRow
                        label="DATE & TIME"
                        value={serviceDate}
                        icon="/icons/calendar.svg"
                      />
                      <DetailRow
                        label="WITH"
                        value={providerName}
                        icon="/icons/location.svg"
                      />
                      <DetailRow
                        label="FOR"
                        value={s.pet?.name ?? "N/A"}
                        icon="/icons/paw.svg"
                      />
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="p-5 border border-gray-200 rounded-xl">
                      <p className="text-gray-800 font-semibold mb-4">
                        Order Summary
                      </p>

                      <div className="space-y-2 text-gray-700">
                        {(s.orderSummary?.items ?? []).map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.serviceName ?? "N/A"}</span>
                            <span>
                              {typeof item.price === "number"
                                ? `$${item.price.toFixed(2)}`
                                : "N/A"}
                            </span>
                          </div>
                        ))}

                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{displaySubtotal}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Tax ({taxPercent}%)</span>
                          <span>
                            {typeof taxAmount === "number"
                              ? `$${taxAmount.toFixed(2)}`
                              : "N/A"}
                          </span>
                        </div>

                        <hr className="my-3" />

                        <div className="flex justify-between font-semibold text-gray-800">
                          <span>Total</span>
                          <span>{displayTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Payment Status</span>
                          <span>{paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[#D6F2F8] flex items-center justify-center">
        <img src={icon} className="w-5 h-5 opacity-70" alt="" />
      </div>

      <div>
        <p className="text-[11px] text-gray-500 font-medium tracking-wide">
          {label}
        </p>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

function ServiceDetailRow({
  service,
}: {
  service: {
    id: number;
    service: string;
    date: string;
    price: string;
    status: string;
  };
}) {
  return (
    <div className="flex items-start justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* LEFT — ICON + TEXT */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Image
            src="/icons/service-grooming.svg" // update icon if needed
            width={24}
            height={24}
            alt="service-icon"
            className="opacity-80"
          />
        </div>

        {/* Text Info */}
        <div>
          <p className="text-xs font-semibold text-gray-500">SERVICE</p>
          <p className="text-gray-800 font-medium">{service.service}</p>

          <p className="text-xs text-gray-500 mt-3">DATA & TIME</p>
          <p className="text-gray-800 font-medium">{service.date}</p>

          <p className="text-xl text-gray-800 font-bold mt-3">
            {service.price}
          </p>
        </div>
      </div>

      {/* RIGHT — STATUS */}
      <span
        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 h-fit
        ${
          service.status === "Processing"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {service.status}
        <span
          className={`h-2 w-2 rounded-full ${
            service.status === "Processing" ? "bg-yellow-500" : "bg-green-500"
          }`}
        />
      </span>
    </div>
  );
}
