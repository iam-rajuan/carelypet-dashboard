"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { fetchPetTypes, updatePetType } from "../../../store/petSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

export default function EditPetType() {
  const router = useRouter();
  const params = useParams();
  const petTypeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const dispatch = useAppDispatch();
  const { petTypes, status, updateStatus, updateError } = useAppSelector(
    (state) => state.pet
  );
  const currentPetType = petTypes.find((petType) => petType.id === petTypeId);
  const [draftType, setDraftType] = useState<string | null>(null);
  const typeValue = draftType ?? currentPetType?.name ?? "";

  useEffect(() => {
    if (!petTypes.length && status === "idle") {
      dispatch(fetchPetTypes());
    }
  }, [dispatch, petTypes.length, status]);

  const handleSave = async () => {
    const trimmedType = typeValue.trim();
    if (!trimmedType || !petTypeId) {
      return;
    }

    try {
      await dispatch(updatePetType({ id: petTypeId, name: trimmedType })).unwrap();
      router.back();
    } catch {
      // Error handled in slice state.
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold text-gray-900">Edit Pet Type</h1>

      {/* INPUT FIELD */}
      <div className="mt-8">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          TYPE
        </label>

        <input
          type="text"
          value={typeValue}
          onChange={(e) => setDraftType(e.target.value)}
          placeholder="Enter pet type"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#9BE3F4]"
        />
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end mt-8 gap-3">
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-xl bg-[#9BE3F4] hover:bg-[#8ad9ec] text-gray-900 font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          disabled={updateStatus === "loading"}
        >
          {updateStatus === "loading" ? "Saving..." : "Save"}
        </button>
      </div>
      {updateError ? (
        <p className="mt-3 text-xs text-red-500" role="alert">
          {updateError}
        </p>
      ) : null}
    </div>
  );
}
