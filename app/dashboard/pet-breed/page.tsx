"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
import Link from "next/link";

import { fetchPetTypes } from "../../store/petSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function PetBreedPage() {
  const dispatch = useAppDispatch();
  const { petTypes, status, error } = useAppSelector((state) => state.pet);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPetTypes());
    }
  }, [dispatch, status]);

  return (
    <div className="p-6 max-w-full">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold text-gray-900">Pet Breed</h1>
      <p className="text-sm text-gray-600 mt-1">
        This section will show how many pet breeds are according to the pet
        type. You can add as many as you want but only under one pet type. You
        cannot add the same pet type in multiple forms.
      </p>

      {/* ADD BUTTON */}
      <div className="flex justify-end mt-5">
        <Link
          href="/dashboard/pet-breed/add"
          className="px-4 py-2 bg-[#A8EAF6] hover:bg-[#9ae4f2] text-gray-900 rounded-xl font-medium flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Pet Breed
        </Link>
      </div>

      {/* TABLE */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm border-b border-gray-300">
            <tr>
              <th className="py-3 px-5 w-16">NO.</th>
              <th className="py-3 px-5">Pet Type</th>
              <th className="py-3 px-5">No. Pet Breed</th>
              <th className="py-3 px-5 w-20 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {status === "loading" && (
              <tr>
                <td className="py-6 px-5 text-center" colSpan={4}>
                  Loading pet types...
                </td>
              </tr>
            )}
            {status === "failed" && (
              <tr>
                <td className="py-6 px-5 text-center text-red-600" colSpan={4}>
                  {error ?? "Failed to load pet types."}
                </td>
              </tr>
            )}
            {status !== "loading" &&
              status !== "failed" &&
              !petTypes.length && (
                <tr>
                  <td className="py-6 px-5 text-center" colSpan={4}>
                    No pet types found.
                  </td>
                </tr>
              )}
            {petTypes.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-4 px-5">{index + 1}</td>
                <td className="py-4 px-5">{item.name}</td>
                <td className="py-4 px-5">{item.petBreedCount ?? 0}</td>

                {/* ACTION MENU */}
                <td className="py-4 px-5 relative text-center">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item.id ? null : item.id)
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical size={18} className="text-gray-700" />
                  </button>

                  {openMenu === item.id && (
                    <div className="absolute right-5 top-10 bg-white border border-gray-50 shadow-lg rounded-lg w-32 z-20">
                      <Link
                        href={`/dashboard/pet-breed/${item.id}`}
                        className="block px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        onClick={() => console.log("delete", item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
