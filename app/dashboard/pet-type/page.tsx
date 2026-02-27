"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import ConfirmModal from "../report/ConfirmModal";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deletePetType, fetchPetTypes } from "../../store/petSlice";

export default function PetTypePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { petTypes, status, error, deleteStatus } = useAppSelector(
    (state) => state.pet,
  );

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPetTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const isInsideMenu = target.closest(`[data-menu-root="${menuOpen}"]`);
      if (!isInsideMenu) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900">Pet Type</h1>
      <p className="text-sm text-gray-600 mt-1">
        This section will show how many pet types are in this system. You can
        add maximum of 5–7.
      </p>

      {/* Add Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => router.push("/dashboard/pet-type/add")}
          className="flex items-center gap-2 bg-[#D6F2F8] hover:bg-[#c9edf5] px-4 py-2 rounded-xl text-gray-800 font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Pet Type
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-left">
          <thead className="text-gray-600 bg-gray-50 text-sm">
            <tr>
              <th className="py-4 px-6">NO.</th>
              <th className="py-4 px-6">Pet Type</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {status === "loading" ? (
              <tr>
                <td className="py-4 px-6" colSpan={3}>
                  Loading pet types...
                </td>
              </tr>
            ) : null}
            {status === "failed" && error ? (
              <tr>
                <td className="py-4 px-6 text-red-600" colSpan={3}>
                  {error}
                </td>
              </tr>
            ) : null}
            {petTypes.map((p, index) => (
              <tr
                key={`${p.id ?? "pet"}-${p.slug ?? index}`}
                className="border-t border-gray-300 hover:bg-gray-50 transition"
              >
                <td className="py-4 px-6">{index + 1}</td>
                <td className="py-4 px-6">{p.name}</td>

                {/* ACTION MENU */}
                <td
                  className="py-4 px-6 text-right border-0 relative"
                  data-menu-root={p.id}
                >
                  <button
                    onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>

                  {menuOpen === p.id && (
                    <div className="absolute right-6 mt-2 w-40 bg-white border border-gray-50 rounded-xl shadow-lg z-20">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-800"
                        onClick={() =>
                          router.push(`/dashboard/pet-type/${p.id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                        onClick={() => {
                          setMenuOpen(null);
                          setDeleteId(p.id);
                          setDeleteOpen(true);
                        }}
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

      {/* DELETE MODAL */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!deleteId) {
            return;
          }

          await dispatch(deletePetType({ id: deleteId }));
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        loading={deleteStatus === "loading"}
      />
    </div>
  );
}
