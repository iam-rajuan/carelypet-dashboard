"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createPetType } from "../../../store/petSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

export default function AddPetType() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createStatus, createError } = useAppSelector((state) => state.pet);
  const [type, setType] = useState("");

  const handleSave = async () => {
    const trimmedType = type.trim();
    if (!trimmedType) {
      return;
    }

    try {
      await dispatch(createPetType({ name: trimmedType })).unwrap();
      router.back();
    } catch {
      // Error is handled in slice state for display.
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold text-gray-900">Add Pet Type</h1>

      {/* FIELD */}
      <div className="mt-8">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          TYPE
        </label>

        <input
          type="text"
          placeholder="Enter pet type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9BE3F4]"
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
          disabled={createStatus === "loading"}
        >
          {createStatus === "loading" ? "Saving..." : "Save"}
        </button>
      </div>
      {createError ? (
        <p className="mt-3 text-xs text-red-500" role="alert">
          {createError}
        </p>
      ) : null}
    </div>
  );
}
