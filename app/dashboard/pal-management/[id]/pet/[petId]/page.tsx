"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  PawPrint,
  HeartPulse,
  Thermometer,
  Activity,
  Syringe,
  Bone,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAppSelector } from "../../../../../store/hooks";

interface UserPet {
  id: string;
  status?: string | null;
  name: string;
  age: number;
  ageLabel?: string | null;
  memoryStart?: string | null;
  type: string;
  gender?: string | null;
  breed?: string | null;
  trained?: boolean | null;
  neutered?: boolean | null;
  vaccinated?: boolean | null;
  avatarUrl?: string | null;
  photos?: string[] | null;
  vitalSigns?: {
    heartRate?: string | null;
    respiratory?: string | null;
    temperature?: string | null;
    weight?: string | null;
  } | null;
  personality?: string[] | null;
  aboutPet?: string | null;
  healthRecordCounts?: {
    vaccination?: number | null;
    checkup?: number | null;
    medication?: number | null;
    tick_flea?: number | null;
    surgery?: number | null;
    dental?: number | null;
    other?: number | null;
  } | null;
}

export default function PetDetailsPage() {
  const { id, petId } = useParams();
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pet, setPet] = useState<UserPet | null>(null);

  useEffect(() => {
    if (!id || !petId) return;
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
    const fetchPet = async () => {
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
          let message = "Failed to load pet details.";
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
        const pets = Array.isArray(body?.data?.pets) ? body.data.pets : [];
        const selectedPet =
          pets.find((item: UserPet) => item.id === petId) ?? null;
        setPet(selectedPet);
        setStatus("idle");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("failed");
        setError(
          err instanceof Error ? err.message : "Failed to load pet details.",
        );
      }
    };

    fetchPet();
    return () => controller.abort();
  }, [accessToken, id, normalizedBaseUrl, petId]);

  const adopted = pet?.status?.toLowerCase() === "adopted";
  const petImages = useMemo(() => {
    if (pet?.photos?.length) return pet.photos;
    if (pet?.avatarUrl) return [pet.avatarUrl];
    return [];
  }, [pet?.avatarUrl, pet?.photos]);

  const displayAge = useMemo(() => {
    if (!pet) return "N/A";
    if (pet.ageLabel) return pet.ageLabel;
    if (typeof pet.age === "number") {
      return `${pet.age} year${pet.age === 1 ? "" : "s"}`;
    }
    return "N/A";
  }, [pet]);

  const displayMemoryStart = useMemo(() => {
    if (!pet?.memoryStart) return "N/A";
    return new Date(pet.memoryStart).toLocaleDateString();
  }, [pet?.memoryStart]);

  const records = [
    {
      title: "Vaccination",
      count: pet?.healthRecordCounts?.vaccination ?? 0,
      color: "bg-[#D6F2F8]",
    },
    {
      title: "Check-up",
      count: pet?.healthRecordCounts?.checkup ?? 0,
      color: "bg-blue-100",
    },
    {
      title: "Medication",
      count: pet?.healthRecordCounts?.medication ?? 0,
      color: "bg-red-100",
    },
    {
      title: "Tick & Flea",
      count: pet?.healthRecordCounts?.tick_flea ?? 0,
      color: "bg-purple-100",
    },
    {
      title: "Surgery",
      count: pet?.healthRecordCounts?.surgery ?? 0,
      color: "bg-pink-100",
    },
    {
      title: "Dental",
      count: pet?.healthRecordCounts?.dental ?? 0,
      color: "bg-orange-100",
    },
    {
      title: "Other",
      count: pet?.healthRecordCounts?.other ?? 0,
      color: "bg-gray-100",
    },
  ];

  return (
    <div className="space-y-12 w-full">
      {status === "loading" ? (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          Loading pet details...
        </div>
      ) : status === "failed" ? (
        <div className="bg-white border rounded-xl p-6 text-red-600">
          {error ?? "Failed to load pet details."}
        </div>
      ) : !pet ? (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          No pet data found.
        </div>
      ) : (
        <>
          {/* STATUS */}
          <div className="flex justify-start">
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                adopted
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {adopted ? "Adopted" : pet.status ?? "Not Adopted"}
            </span>
          </div>

      {/* GALLERY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {petImages.length === 0 ? (
              <div className="rounded-xl overflow-hidden h-56 md:h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                No images available.
              </div>
            ) : (
              petImages.map((img) => (
                <div key={img} className="rounded-xl overflow-hidden h-56 md:h-64">
                  <Image
                    src={img}
                    alt="Pet Image"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            )}
          </div>

      {/* NAME & AGE */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              {pet.name} <span className="text-[#00A8C5]">•</span> {displayAge}
            </h1>

            <div className="text-right">
              <p className="text-xs text-gray-500">Memory Start</p>
              <p className="text-sm font-medium">{displayMemoryStart}</p>
            </div>
          </div>

      {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
            {[
              {
                label: "Type",
                value: pet.type,
                icon: <PawPrint className="h-5 w-5" />,
              },
              {
                label: "Gender",
                value: pet.gender ?? "N/A",
                icon: <User className="h-5 w-5" />,
              },
              {
                label: "Breed",
                value: pet.breed ?? "N/A",
                icon: <Bone className="h-5 w-5" />,
              },
              {
                label: "Trained",
                value: pet.trained ? "Yes" : "No",
                icon: <Activity className="h-5 w-5" />,
              },
              {
                label: "Neutered",
                value: pet.neutered ? "Yes" : "No",
                icon: <Activity className="h-5 w-5" />,
              },
              {
                label: "Vaccinated",
                value: pet.vaccinated ? "Yes" : "No",
                icon: <Syringe className="h-5 w-5" />,
              },
              {
                label: "Heart Rate",
                value: pet.vitalSigns?.heartRate ?? "N/A",
                icon: <HeartPulse className="h-5 w-5" />,
              },
              {
                label: "Respiratory",
                value: pet.vitalSigns?.respiratory ?? "N/A",
                icon: <Activity className="h-5 w-5" />,
              },
              {
                label: "Temperature",
                value: pet.vitalSigns?.temperature ?? "N/A",
                icon: <Thermometer className="h-5 w-5" />,
              },
              {
                label: "Weight",
                value: pet.vitalSigns?.weight ?? "N/A",
                icon: <Bone className="h-5 w-5" />,
              },
              {
                label: "Personality",
                value: pet.personality?.length
                  ? pet.personality.join(", ")
                  : "N/A",
                icon: <PawPrint className="h-5 w-5" />,
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#D6F2F8] text-[#00A8C5] rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

      {/* ABOUT */}
          <div className="border-t pt-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">About Pet</h2>
            <p className="text-gray-600 leading-relaxed">
              {pet.aboutPet ?? "N/A"}{" "}
              <span className="text-[#00A8C5] cursor-pointer">See more</span>
            </p>
          </div>

      {/* HEALTH RECORDS */}
          <div className="border-t pt-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">
              Health Records
            </h2>

            {records.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No health records available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {records.map((rec) => (
                  <div
                    key={rec.title}
                    className="bg-white rounded-xl border p-5 flex flex-col shadow-sm"
                  >
                    <p className="text-xs text-gray-500 uppercase">
                      {rec.title}
                    </p>
                    <h3 className="text-2xl font-semibold text-gray-900 mt-1">
                      {rec.count}
                    </h3>

                    <div className="flex-1" />

                    <button className="mt-4 bg-[#D6F2F8] hover:bg-[#c9edf5] text-[#006778] py-2 rounded-lg text-sm font-medium">
                      View →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
