"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bug,
  Bone,
  Eye,
  FileText,
  Pill,
  Scissors,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import HealthRecordsModal, {
  type HealthRecordsModalRecord,
} from "../../components/HealthRecordsModal";
import { useAppSelector } from "../../../../store/hooks";
import RecordTypeModal from "../../add/RecordTypeModal";
import type { HealthRecordFormValues } from "../../add/HealthRecordFormModal";
import { log } from "console";

type AttachmentType = "pdf" | "doc" | "image";

interface RecordAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  size: string;
}

interface HealthRecord {
  _id?: string;
  type?: string | null;
  recordDetails?: {
    recordName?: string | null;
    batchLotNo?: string | null;
    otherInfo?: string | null;
    cost?: string | null;
    date?: string | null;
    nextDueDate?: string | null;
    reminder?: {
      enabled?: boolean | null;
      offset?: string | null;
    } | null;
  } | null;
  veterinarian?: {
    designation?: string | null;
    name?: string | null;
    clinicName?: string | null;
    licenseNo?: string | null;
    contact?: string | null;
  } | null;
  vitalSigns?: {
    weight?: string | null;
    temperature?: string | null;
    heartRate?: string | null;
    respiratory?: string | null;
    status?: string | null;
  } | null;
  observation?: {
    lookupObservations?: string[] | null;
    clinicalNotes?: string | null;
  } | null;
  attachments?: Array<RecordAttachment | string>;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const healthRecordTypes = [
  {
    label: "Vaccination",
    icon: Syringe,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Check-up",
    icon: Stethoscope,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Medication",
    icon: Pill,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    label: "Tick & Flea",
    icon: Bug,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Surgery",
    icon: Scissors,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    label: "Dental",
    icon: Bone,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    label: "Other",
    icon: FileText,
    iconBg: "bg-gray-200",
    iconColor: "text-gray-600",
  },
];

type AdoptionDetail = {
  _id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  petName?: string | null;
  species?: string | null;
  breed?: string | null;
  age?: number | null;
  weightLbs?: number | null;
  gender?: string | null;
  trained?: boolean | null;
  vaccinated?: boolean | null;
  neutered?: boolean | null;
  personality?: string[] | null;
  aboutPet?: string | null;
  photos?: string[] | null;
  shelterName?: string | null;
  shelterPhone?: string | null;
  healthRecords?: HealthRecord[] | null;
};

type AdoptionDetailResponse = {
  success: boolean;
  data: AdoptionDetail;
};

type HealthRecordsResponse = {
  success: boolean;
  data: HealthRecord[] | { records?: HealthRecord[] | null } | null;
};

const getAttachmentType = (nameOrUrl: string): AttachmentType => {
  const lower = nameOrUrl.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "doc";
  return "image";
};

const getFileName = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1] || "File";
};

const normalizeRecordType = (label: string) => {
  const key = label.trim().toLowerCase();
  if (key === "check-up" || key === "check up") return "checkup";
  if (key === "tick & flea" || key === "tick and flea") return "tick_flea";
  return key.replace(/\s+/g, "_");
};

const labelForRecordType = (type?: string | null) => {
  const key = (type ?? "").trim().toLowerCase();
  if (key === "checkup" || key === "check-up" || key === "check up")
    return "Check-up";
  if (key === "tick_flea" || key === "tick & flea" || key === "tick and flea")
    return "Tick & Flea";
  if (key === "medication") return "Medication";
  if (key === "surgery") return "Surgery";
  if (key === "dental") return "Dental";
  if (key === "vaccination") return "Vaccination";
  if (key) return `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  return "Other";
};

export default function ViewPetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const [petData, setPetData] = useState<AdoptionDetail | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [recordsStatus, setRecordsStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<string | null>(null);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [addRecordStatus, setAddRecordStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [addRecordError, setAddRecordError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    const listingId = params?.id;
    if (!listingId) return false;
    if (!normalizedBaseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setStatus("failed");
      return false;
    }
    if (!accessToken) {
      setError("Missing access token.");
      setStatus("failed");
      return false;
    }

    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/adoptions/${listingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to fetch adoption detail.";
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

      const data = (await response.json()) as AdoptionDetailResponse;
      if (!data?.data) {
        throw new Error("Invalid adoption detail response.");
      }
      setPetData(data.data);
      setStatus("idle");
      return true;
    } catch (err) {
      setStatus("failed");
      setError(
        err instanceof Error ? err.message : "Failed to fetch adoption detail.",
      );
      return false;
    }
  }, [accessToken, normalizedBaseUrl, params?.id]);

  const fetchHealthRecords = useCallback(async () => {
    const listingId = params?.id;
    if (!listingId) return false;
    if (!normalizedBaseUrl) {
      setRecordsError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setRecordsStatus("failed");
      return false;
    }
    if (!accessToken) {
      setRecordsError("Missing access token.");
      setRecordsStatus("failed");
      return false;
    }

    setRecordsStatus("loading");
    setRecordsError(null);
    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/adoptions/${listingId}/health-records`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to fetch health records.";
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

      const payload = (await response.json()) as HealthRecordsResponse;
      const records = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.records)
          ? payload.data.records
          : [];
      setHealthRecords(records ?? []);
      setRecordsStatus("idle");
      return true;
    } catch (err) {
      setRecordsStatus("failed");
      setRecordsError(
        err instanceof Error ? err.message : "Failed to fetch health records.",
      );
      return false;
    }
  }, [accessToken, normalizedBaseUrl, params?.id]);

  useEffect(() => {
    if (!params?.id) return;
    fetchDetail();
    fetchHealthRecords();
  }, [fetchDetail, fetchHealthRecords, params?.id]);

  const recordData = useMemo(() => {
    if (!healthRecords.length) return [];
    return healthRecords.map((record, index) => ({
      id: record._id || `${record.type ?? "record"}-${index}`,
      type: labelForRecordType(record.type),
      name: record.recordDetails?.recordName || "Record",
      updatedAt:
        record.updatedAt ||
        record.recordDetails?.date ||
        record.createdAt ||
        "N/A",
      reminder:
        record.recordDetails?.nextDueDate ||
        record.recordDetails?.reminder?.offset ||
        "No reminder",
      attachments: (record.attachments ?? []).map(
        (attachment: RecordAttachment | string, attachmentIndex) => {
          if (typeof attachment === "string") {
            const url = attachment;
            const name = getFileName(url);
            return {
              id: `${index}-${attachmentIndex}`,
              name,
              type: getAttachmentType(name),
              url,
              size: "N/A",
            };
          }
          const url = attachment.url || "";
          const name = attachment.name || getFileName(url);
          return {
            id: attachment.id || `${index}-${attachmentIndex}`,
            name,
            type: attachment.type || getAttachmentType(name),
            url,
            size: attachment.size || "N/A",
          };
        },
      ),
    }));
  }, [healthRecords]);

  const recordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    recordData.forEach((record) => {
      counts[record.type] = (counts[record.type] ?? 0) + 1;
    });
    return counts;
  }, [recordData]);

  const recordsForView: HealthRecordsModalRecord[] = useMemo(() => {
    if (!viewType) return [];
    return recordData
      .filter((record) => record.type === viewType)
      .map((record) => ({
        id: record.id,
        title: record.name,
        subtitle: `Last updated ${record.updatedAt}, ${record.reminder}`,
        attachments: record.attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
          sizeLabel: attachment.size,
        })),
      }));
  }, [viewType, recordData]);

  const handleAddRecord = async (record: HealthRecordFormValues) => {
    const listingId = params?.id;
    if (!listingId) {
      setAddRecordError("Missing listing id.");
      setAddRecordStatus("failed");
      return;
    }
    if (!normalizedBaseUrl) {
      setAddRecordError("NEXT_PUBLIC_API_BASE_URL is not set.");
      setAddRecordStatus("failed");
      return;
    }
    if (!accessToken) {
      setAddRecordError("Missing access token.");
      setAddRecordStatus("failed");
      return;
    }

    setAddRecordStatus("loading");
    setAddRecordError(null);
    setAddRecordOpen(false);
    try {
      const healthPayload = new FormData();
      healthPayload.append("type", normalizeRecordType(record.type));
      healthPayload.append(
        "recordDetails",
        JSON.stringify({
          recordName: record.recordName,
          batchLotNo: record.batchNumber,
          otherInfo: record.otherInfo,
          cost: record.cost,
          date: record.date,
          nextDueDate: record.nextDueDate,
        }),
      );
      healthPayload.append(
        "veterinarian",
        JSON.stringify({
          designation: record.vetDesignation,
          name: record.vetName,
          clinicName: record.clinicName,
          licenseNo: record.licenseNumber,
          contact: record.contact,
        }),
      );
      healthPayload.append(
        "vitalSigns",
        JSON.stringify({
          weight: record.weight,
          temperature: record.temperature,
          heartRate: record.heartRate,
          respiratory: record.respiratory,
          status: record.status.toLowerCase(),
        }),
      );
      healthPayload.append(
        "observation",
        JSON.stringify({
          lookupObservations: [],
          clinicalNotes: "",
        }),
      );
      record.attachments.forEach((file) => {
        healthPayload.append("files", file);
      });

      for (const [key, value] of healthPayload.entries()) {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            type: value.type,
            size: value.size,
          });
        } else {
          console.log(key, value);
        }
      }

      const healthResponse = await fetch(
        `${normalizedBaseUrl}/admin/adoptions/${listingId}/health-records`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: healthPayload,
        },
      );

      if (!healthResponse.ok) {
        let message = `Failed to add ${record.type} health record.`;
        try {
          const errorBody = await healthResponse.json();
          message = errorBody?.message ?? message;
        } catch {
          try {
            const errorText = await healthResponse.text();
            if (errorText) message = errorText;
          } catch {
            // Keep fallback message.
          }
        }
        throw new Error(message);
      }

      let responseBody: AdoptionDetailResponse | null = null;
      try {
        responseBody = (await healthResponse.json()) as AdoptionDetailResponse;
      } catch {
        responseBody = null;
      }

      if (responseBody?.data?.healthRecords) {
        setHealthRecords(responseBody.data.healthRecords);
      } else {
        await fetchHealthRecords();
      }

      setAddRecordStatus("idle");
      setAddRecordOpen(false);
    } catch (err) {
      setAddRecordStatus("failed");
      setAddRecordError(
        err instanceof Error ? err.message : "Failed to add health record.",
      );
    }
  };

  const petName = petData?.petName ?? petData?.title ?? "Pet";
  const petAge = petData?.age;
  const personality = petData?.personality?.length
    ? petData.personality.join(", ")
    : "N/A";
  const aboutPet = petData?.aboutPet ?? petData?.description ?? "N/A";
  const photos = petData?.photos ?? [];

  return (
    <div className="px-6 py-5">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            View pet for adoption
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            This section will display all the information that you have added.
          </p>
        </div>

        <button
          onClick={() => router.push(`/dashboard/adoption-list/${params.id}`)}
          className="px-4 py-2 bg-[#D6F2F8] hover:bg-[#c9edf5] rounded-lg flex items-center gap-2 text-gray-800"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a4 4 0 0 1 5.6 5.6l-9.1 9.1L10 14l6.5-10.5Z" />
          </svg>
          Edit
        </button>
      </div>

      {status === "loading" && (
        <p className="mt-6 text-sm text-gray-600">Loading adoption detail...</p>
      )}
      {status === "failed" && (
        <p className="mt-6 text-sm text-red-600">
          {error ?? "Failed to load adoption detail."}
        </p>
      )}

      {/* PET TITLE */}
      {petData && status !== "failed" && (
        <div className="flex items-center gap-2 mt-6">
          <h2 className="text-2xl font-semibold text-gray-900">{petName}</h2>
          {typeof petAge === "number" && (
            <span className="text-gray-600 text-sm">
              • {petAge} year{petAge === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}

      {/* PET MAIN DETAILS */}
      {petData && status !== "failed" && (
        <div className="grid md:grid-cols-3 gap-6 bg-none border-t border-gray-400 mt-6 pt-6">
          <Detail icon="🐶" title="TYPE" value={petData.species ?? "N/A"} />
          <Detail icon="♂️" title="GENDER" value={petData.gender ?? "N/A"} />
          <Detail icon="🐕" title="BREED" value={petData.breed ?? "N/A"} />

          <Detail
            icon="🎓"
            title="TRAINED"
            value={petData.trained ? "Yes" : "No"}
          />
          <Detail
            icon="✂️"
            title="NEUTERED"
            value={petData.neutered ? "Yes" : "No"}
          />
          <Detail
            icon="💉"
            title="VACCINATED"
            value={petData.vaccinated ? "Yes" : "No"}
          />

          <Detail
            icon="⚖️"
            title="WEIGHT"
            value={
              typeof petData.weightLbs === "number"
                ? `${petData.weightLbs} lbs`
                : "N/A"
            }
          />

          <div className="flex gap-3 items-start mt-4">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xl">
              🏠
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Shelter Information
              </p>
              <p className="font-medium text-gray-800">
                {petData.shelterName ?? "N/A"}
              </p>
              <p className="text-gray-500 text-sm">
                {petData.shelterPhone ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="md:col-span-3 mt-4">
            <p className="text-xs text-gray-500 font-medium">PERSONALITY</p>
            <p className="font-medium text-gray-800 mt-1">{personality}</p>
          </div>
        </div>
      )}

      {/* ABOUT PET */}
      {petData && status !== "failed" && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900">About Pet</h3>

          <p className="text-gray-700 text-sm mt-2 max-w-3xl">{aboutPet}</p>
        </div>
      )}

      {/* PET SNAPS */}
      {petData && status !== "failed" && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900">Pet Snaps</h3>

          <div className="mt-4 border border-gray-200 rounded-xl bg-white">
            {photos.length ? (
              photos.map((photo, index) => {
                const name = getFileName(photo);
                return (
                  <div
                    key={`${photo}-${index}`}
                    className="flex items-center justify-between px-4 py-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        📷
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-xs text-gray-500">Image</p>
                      </div>
                    </div>

                    <Eye className="text-gray-500 w-5 h-5 cursor-pointer" />
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500">
                No snaps uploaded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEALTH RECORDS */}
      <div className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Health Records
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              All the health records are recorded here. You can pick individual
              to view that file.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddRecordError(null);
              setAddRecordOpen(true);
            }}
            className="px-4 py-2 bg-[#D6F2F8] hover:bg-[#c9edf5] rounded-xl text-gray-800 font-medium"
          >
            Add Health Record
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {healthRecordTypes.map((recordType) => {
            const Icon = recordType.icon;
            return (
              <div
                key={recordType.label}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3">
                    <p className="text-xs text-gray-500">{recordType.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {recordCounts[recordType.label] ?? 0}
                    </p>
                  </div>
                  <span
                    className={`h-9 w-9 rounded-full flex items-center justify-center ${recordType.iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${recordType.iconColor}`} />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setViewType(recordType.label)}
                  className="mt-4 w-full bg-white text-gray-600 text-sm font-medium rounded-full py-2 flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-100"
                >
                  View →
                </button>
              </div>
            );
          })}
        </div>
        {addRecordError ? (
          <p className="text-xs text-red-500 mt-3" role="alert">
            {addRecordError}
          </p>
        ) : null}
        {recordsStatus === "failed" && recordsError ? (
          <p className="text-xs text-red-500 mt-2" role="alert">
            {recordsError}
          </p>
        ) : null}
      </div>

      <HealthRecordsModal
        open={Boolean(viewType)}
        title={`${viewType ?? ""} Records`}
        records={recordsForView}
        onClose={() => setViewType(null)}
      />

      {addRecordOpen && (
        <RecordTypeModal
          open={addRecordOpen}
          onClose={() => {
            if (addRecordStatus === "loading") return;
            setAddRecordOpen(false);
          }}
          onSave={handleAddRecord}
        />
      )}
    </div>
  );
}

/* ----------- REUSABLE DETAIL ITEM ----------- */
function Detail({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-10 h-10 rounded-full bg-[#D6F2F8] flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
