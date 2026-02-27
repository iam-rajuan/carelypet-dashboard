"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { fetchPetTypes } from "../../../store/petSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

export default function EditPetBreed() {
  const router = useRouter();
  const params = useParams();
  const petTypeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const dispatch = useAppDispatch();
  const { petTypes, status: petTypeStatus } = useAppSelector(
    (state) => state.pet,
  );
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const [selectedType, setSelectedType] = useState(petTypeId ?? "");
  const [breeds, setBreeds] = useState<string[]>([]);
  const [breedsStatus, setBreedsStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [breedsError, setBreedsError] = useState<string | null>(null);
  const [breedInput, setBreedInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  useEffect(() => {
    if (!petTypes.length && petTypeStatus === "idle") {
      dispatch(fetchPetTypes());
    }
  }, [dispatch, petTypes.length, petTypeStatus]);

  useEffect(() => {
    if (!selectedType) {
      if (petTypeId) {
        setSelectedType(petTypeId);
      } else if (petTypes.length) {
        setSelectedType(petTypes[0].id);
      }
    }
  }, [petTypeId, petTypes, selectedType]);

  const fetchBreeds = useCallback(
    async (typeId: string) => {
      if (!normalizedBaseUrl) {
        setBreedsStatus("failed");
        setBreedsError("NEXT_PUBLIC_API_BASE_URL is not set.");
        return;
      }

      if (!accessToken) {
        setBreedsStatus("failed");
        setBreedsError("Missing access token.");
        return;
      }

      setBreedsStatus("loading");
      setBreedsError(null);

      try {
        const response = await fetch(
          `${normalizedBaseUrl}/admin/pet-types/${typeId}/breeds`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to fetch pet breeds.";
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
          throw new Error("Invalid pet breeds response.");
        }

        const names = list
          .map((breed: { name?: string }) => breed?.name)
          .filter(
            (name: string | undefined): name is string =>
              typeof name === "string" && name.trim().length > 0,
          );
        setBreeds(names);
        setBreedsStatus("succeeded");
      } catch (err) {
        setBreeds([]);
        setBreedsStatus("failed");
        setBreedsError(
          err instanceof Error ? err.message : "Failed to fetch pet breeds.",
        );
      }
    },
    [accessToken, normalizedBaseUrl],
  );

  useEffect(() => {
    if (!selectedType) {
      setBreeds([]);
      setBreedsStatus("idle");
      setBreedsError(null);
      return;
    }

    void fetchBreeds(selectedType);
  }, [fetchBreeds, selectedType]);

  const addBreed = () => {
    if (!breedInput.trim()) return;
    setBreeds([...breeds, breedInput.trim()]);
    setBreedInput("");
  };

  const removeBreed = (breed: string) => {
    setBreeds(breeds.filter((b) => b !== breed));
  };

  const handleSave = async () => {
    if (!selectedType) {
      setSaveStatus("failed");
      setSaveError("Missing pet type.");
      return;
    }

    if (!normalizedBaseUrl) {
      setSaveStatus("failed");
      setSaveError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }

    if (!accessToken) {
      setSaveStatus("failed");
      setSaveError("Missing access token.");
      return;
    }

    const trimmedBreeds = breeds
      .map((breed) => breed.trim())
      .filter((breed) => breed.length > 0);

    setSaveStatus("loading");
    setSaveError(null);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/pet-types/${selectedType}/breeds`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ breeds: trimmedBreeds }),
        },
      );

      if (!response.ok) {
        let message = "Failed to update pet breeds.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      setSaveStatus("succeeded");
      if (typeof window !== "undefined" && document.referrer) {
        window.location.assign(document.referrer);
        return;
      }
      router.back();
    } catch (err) {
      setSaveStatus("failed");
      setSaveError(
        err instanceof Error ? err.message : "Failed to update pet breeds.",
      );
    }
  };

  return (
    <div className="p-6 md:p-10">
      {/* TITLE */}
      <h1 className="text-2xl font-semibold text-gray-900">Edit Pet Breed</h1>
      <p className="text-sm text-gray-600 mt-1">
        Edit the details as you think.
      </p>

      {/* PET TYPE */}
      <div className="mt-8">
        <label className="text-xs font-medium text-gray-500">PET TYPE</label>
        <div className="relative mt-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 appearance-none"
          >
            {!petTypes.length && (
              <option value="" disabled>
                {petTypeStatus === "loading"
                  ? "Loading pet types..."
                  : "No pet types available"}
              </option>
            )}
            {petTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* BREED SECTION */}
      <div className="mt-8">
        <label className="text-xs font-medium text-gray-500">BREED</label>

        <div className="bg-gray-50 w-full border border-gray-200 rounded-xl min-h-[110px] mt-2 p-3">
          {/* Breed Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {breedsStatus === "loading" && (
              <span className="text-sm text-gray-500">
                Loading pet breeds...
              </span>
            )}
            {breedsStatus === "failed" && (
              <span className="text-sm text-red-500">
                {breedsError ?? "Failed to load pet breeds."}
              </span>
            )}
            {breedsStatus === "succeeded" && breeds.length === 0 && (
              <span className="text-sm text-gray-500">No breeds found.</span>
            )}
            {breedsStatus !== "loading" &&
              breedsStatus !== "failed" &&
              breeds.map((breed) => (
                <span
                  key={breed}
                  className="px-3 py-1 bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm"
                >
                  {breed}
                  <X
                    onClick={() => removeBreed(breed)}
                    className="h-4 w-4 cursor-pointer hover:text-gray-300"
                  />
                </span>
              ))}
          </div>

          {/* Add Breed Input */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <input
              value={breedInput}
              onChange={(e) => setBreedInput(e.target.value)}
              placeholder="Add a breed..."
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
            />

            <button
              onClick={addBreed}
              className="text-[#0E6473] font-medium hover:opacity-80"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-4 mt-10">
        <button className="px-6 py-2 bg-gray-100 rounded-lg text-gray-800 hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saveStatus === "loading"}
          className="px-6 py-2 bg-[#A5E8F0] rounded-lg text-gray-900 font-medium hover:bg-[#93e0ea] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveStatus === "loading" ? "Saving..." : "Save"}
        </button>
      </div>
      {saveError ? (
        <p className="mt-3 text-xs text-red-500" role="alert">
          {saveError}
        </p>
      ) : null}
    </div>
  );
}
