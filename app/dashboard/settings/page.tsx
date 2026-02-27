"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilLine, Check, X } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

export default function SettingsPage() {
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);

  const [taxStatus, setTaxStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [taxError, setTaxError] = useState<string | null>(null);
  const [taxPercent, setTaxPercent] = useState("");
  const [originalTaxPercent, setOriginalTaxPercent] = useState<number | null>(
    null,
  );
  const [servicesStatus, setServicesStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [services, setServices] = useState({
    vet: "",
    walking: "",
    grooming: "",
    training: "",
  });
  const [originalServices, setOriginalServices] = useState({
    vet: "",
    walking: "",
    grooming: "",
    training: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const fetchTaxSettings = useCallback(async () => {
    if (!normalizedBaseUrl) {
      setTaxStatus("failed");
      setTaxError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }

    if (!accessToken) {
      setTaxStatus("failed");
      setTaxError("Missing access token.");
      return;
    }

    setTaxStatus("loading");
    setTaxError(null);

    try {
      const response = await fetch(`${normalizedBaseUrl}/admin/settings/tax`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        let message = "Failed to fetch tax settings.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const percent = data?.data?.percent;
      if (typeof percent !== "number") {
        throw new Error("Invalid tax settings response.");
      }

      setTaxPercent(String(percent));
      setOriginalTaxPercent(percent);
      setTaxStatus("succeeded");
    } catch (err) {
      setTaxStatus("failed");
      setTaxError(
        err instanceof Error ? err.message : "Failed to fetch tax settings.",
      );
    }
  }, [accessToken, normalizedBaseUrl]);

  useEffect(() => {
    if (taxStatus === "idle") {
      void fetchTaxSettings();
    }
  }, [fetchTaxSettings, taxStatus]);

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;

  const fetchServices = useCallback(async () => {
    if (!normalizedBaseUrl) {
      setServicesStatus("failed");
      setServicesError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }

    if (!accessToken) {
      setServicesStatus("failed");
      setServicesError("Missing access token.");
      return;
    }

    setServicesStatus("loading");
    setServicesError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/settings/services`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to fetch service charges.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const list = Array.isArray(data?.data) ? data.data : null;
      if (!list) {
        throw new Error("Invalid services response.");
      }

      const nextServices = {
        vet: "",
        walking: "",
        grooming: "",
        training: "",
      };

      list.forEach(
        (service: { type?: string; price?: number; isActive?: boolean }) => {
          if (
            !service ||
            typeof service.type !== "string" ||
            typeof service.price !== "number"
          ) {
            return;
          }

          const key = service.type.toLowerCase();
          if (key in nextServices) {
            nextServices[key as keyof typeof nextServices] = formatPrice(
              service.price,
            );
          }
        },
      );

      setServices(nextServices);
      setOriginalServices(nextServices);
      setServicesStatus("succeeded");
    } catch (err) {
      setServicesStatus("failed");
      setServicesError(
        err instanceof Error ? err.message : "Failed to fetch service charges.",
      );
    }
  }, [accessToken, normalizedBaseUrl]);

  useEffect(() => {
    if (servicesStatus === "idle") {
      void fetchServices();
    }
  }, [fetchServices, servicesStatus]);

  const saveTax = async () => {
    if (!normalizedBaseUrl) {
      setTaxError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }

    if (!accessToken) {
      setTaxError("Missing access token.");
      return;
    }

    const parsedPercent = Number(taxPercent);
    if (!Number.isFinite(parsedPercent)) {
      setTaxError("Tax must be a valid number.");
      return;
    }

    setTaxStatus("loading");
    setTaxError(null);

    try {
      const response = await fetch(`${normalizedBaseUrl}/admin/settings/tax`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ percent: parsedPercent }),
      });

      if (!response.ok) {
        let message = "Failed to update tax settings.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const percent = data?.data?.percent ?? parsedPercent;
      setTaxPercent(String(percent));
      setOriginalTaxPercent(percent);
      setTaxStatus("succeeded");
      setIsEditingTax(false);
    } catch (err) {
      setTaxStatus("failed");
      setTaxError(
        err instanceof Error ? err.message : "Failed to update tax settings.",
      );
    }
  };

  const cancelTax = () => {
    if (originalTaxPercent !== null) {
      setTaxPercent(String(originalTaxPercent));
    }
    setIsEditingTax(false);
    setTaxError(null);
  };

  const parsePrice = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const saveServices = async () => {
    if (!normalizedBaseUrl) {
      setServicesError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }

    if (!accessToken) {
      setServicesError("Missing access token.");
      return;
    }

    const vetPrice = parsePrice(services.vet);
    const walkingPrice = parsePrice(services.walking);
    const groomingPrice = parsePrice(services.grooming);
    const trainingPrice = parsePrice(services.training);

    if (
      vetPrice === null ||
      walkingPrice === null ||
      groomingPrice === null ||
      trainingPrice === null
    ) {
      setServicesError("Please enter valid prices for all services.");
      return;
    }

    setServicesStatus("loading");
    setServicesError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/settings/services`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            services: [
              { name: "VET", type: "vet", price: vetPrice, isActive: true },
              {
                name: "WALKING",
                type: "walking",
                price: walkingPrice,
                isActive: true,
              },
              {
                name: "GROOMING",
                type: "grooming",
                price: groomingPrice,
                isActive: true,
              },
              {
                name: "TRAINING",
                type: "training",
                price: trainingPrice,
                isActive: true,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        let message = "Failed to update service charges.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const list = Array.isArray(data?.data) ? data.data : null;
      if (!list) {
        throw new Error("Invalid services response.");
      }

      const nextServices = {
        vet: "",
        walking: "",
        grooming: "",
        training: "",
      };

      list.forEach(
        (service: { type?: string; price?: number; isActive?: boolean }) => {
          if (
            !service ||
            typeof service.type !== "string" ||
            typeof service.price !== "number"
          ) {
            return;
          }

          const key = service.type.toLowerCase();
          if (key in nextServices) {
            nextServices[key as keyof typeof nextServices] = formatPrice(
              service.price,
            );
          }
        },
      );

      setServices(nextServices);
      setOriginalServices(nextServices);
      setServicesStatus("succeeded");
      setIsEditingServices(false);
    } catch (err) {
      setServicesStatus("failed");
      setServicesError(
        err instanceof Error
          ? err.message
          : "Failed to update service charges.",
      );
    }
  };
  const cancelServices = () => {
    setServices(originalServices);
    setIsEditingServices(false);
    setServicesError(null);
  };

  return (
    <div className="space-y-10 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          From here you can control your app settings.
        </p>
      </div>

      {/* -------------------------------------- TAX SETTINGS -------------------------------------- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Tax Percentage Settings
          </h2>

          {!isEditingTax ? (
            <button
              onClick={() => setIsEditingTax(true)}
              className="flex items-center gap-2 bg-[#D6F2F8] px-4 py-1.5 rounded-xl text-gray-800 hover:bg-[#c9edf5]"
            >
              <PencilLine className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={cancelTax}
                className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-xl text-gray-700 hover:bg-gray-200"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={saveTax}
                disabled={taxStatus === "loading"}
                className="flex items-center gap-2 bg-[#D6F2F8] px-4 py-1.5 rounded-xl text-gray-800 hover:bg-[#c9edf5]"
              >
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>

        {/* TAX VALUE */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-600">TAX</p>

          {taxStatus === "loading" && !isEditingTax ? (
            <p className="mt-2 text-gray-800">Loading...</p>
          ) : !isEditingTax ? (
            <p className="mt-2 text-gray-800">
              {taxPercent ? `${taxPercent}%` : "—"}
            </p>
          ) : (
            <input
              className="mt-2 border border-gray-300 w-full rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              inputMode="decimal"
            />
          )}

          {taxError && <p className="mt-3 text-sm text-red-600">{taxError}</p>}

          <hr className="mt-4" />
        </div>
      </div>

      {/* -------------------------------------- SERVICE CHARGE -------------------------------------- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Services Charge
          </h2>

          {!isEditingServices ? (
            <button
              onClick={() => setIsEditingServices(true)}
              className="flex items-center gap-2 bg-[#D6F2F8] px-4 py-1.5 rounded-xl text-gray-800 hover:bg-[#c9edf5]"
            >
              <PencilLine className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={cancelServices}
                className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-xl text-gray-700 hover:bg-gray-200"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={saveServices}
                className="flex items-center gap-2 bg-[#D6F2F8] px-4 py-1.5 rounded-xl text-gray-800 hover:bg-[#c9edf5]"
              >
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>

        {/* SERVICE GRID */}
        <div className="mt-6">
          {servicesStatus === "loading" && (
            <p className="text-sm text-gray-600">Loading service charges...</p>
          )}
          {servicesStatus === "failed" && (
            <p className="text-sm text-red-600">
              {servicesError ?? "Failed to load service charges."}
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div>
            {/* VET */}
            <ServiceField
              label="VET"
              value={services.vet}
              editable={isEditingServices}
              onChange={(v) => setServices({ ...services, vet: v })}
            />

            {/* WALKING */}
            <ServiceField
              label="WALKING"
              value={services.walking}
              editable={isEditingServices}
              onChange={(v) => setServices({ ...services, walking: v })}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* GROOMING */}
            <ServiceField
              label="GROOMING"
              value={services.grooming}
              editable={isEditingServices}
              onChange={(v) => setServices({ ...services, grooming: v })}
            />

            {/* TRAINING */}
            <ServiceField
              label="TRAINING"
              value={services.training}
              editable={isEditingServices}
              onChange={(v) => setServices({ ...services, training: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceField({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-600">{label}</p>

      {!editable ? (
        <p className="mt-2 text-gray-800 font-medium">{value}</p>
      ) : (
        <input
          className="mt-2 border border-gray-300 w-full rounded-lg px-3 py-2 bg-gray-50  text-gray-700 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <hr className="mt-4" />
    </div>
  );
}
