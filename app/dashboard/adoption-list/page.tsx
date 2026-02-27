"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ConfirmModal from "../report/ConfirmModal";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAdoptionSummary } from "../../store/adoptionSlice";

export default function AdoptionManagementPage() {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const menuRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.adoption.items);
  const status = useAppSelector((state) => state.adoption.status);
  const isRefreshing = useAppSelector((state) => state.adoption.isRefreshing);
  const error = useAppSelector((state) => state.adoption.error);
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchAdoptionSummary({ page, limit: pageSize }));
  }, [dispatch, page, pageSize]);

  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, currentPage, pageSize]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setDeleteOpen(true);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    if (!normalizedBaseUrl) {
      setDeleteError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }
    if (!accessToken) {
      setDeleteError("Missing access token.");
      return;
    }

    setDeleteStatus("loading");
    setDeleteError(null);
    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/adoptions/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to delete adoption listing.";
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

      setDeleteStatus("idle");
      setDeleteOpen(false);
      setSelectedId(null);
      dispatch(fetchAdoptionSummary({ page, limit: pageSize }));
    } catch (err) {
      setDeleteStatus("failed");
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Failed to delete adoption listing.",
      );
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Adoption List
          </h1>
          <p className="text-gray-500 text-sm">
            This section will show those pets you want to put on auction on your
            app.
          </p>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => router.push("/dashboard/adoption-list/add")}
          className="flex items-center gap-2 bg-[#D6F2F8] hover:bg-[#c8eef4] px-5 py-2 rounded-xl font-medium text-gray-800"
        >
          <Plus className="h-5 w-5" />
          Add Pet for Adoption
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              {[
                "NO.",
                "Pet Name",
                "Pet Type",
                "Pet Breed",
                "Pet Age",
                "Status",
                "Action",
              ].map((title) => (
                <th
                  key={title}
                  className="py-3 px-5 text-sm font-medium text-gray-600"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {status === "loading" && items.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={7} className="py-6 px-5 text-center text-gray-600">
                  Loading adoption list...
                </td>
              </tr>
            ) : status === "failed" && items.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={7} className="py-6 px-5 text-center text-red-600">
                  {error ?? "Failed to load adoption list."}
                </td>
              </tr>
            ) : pagedItems.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={7} className="py-6 px-5 text-center text-gray-600">
                  No pets found.
                </td>
              </tr>
            ) : (
              pagedItems.map((item, index) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="py-4 px-5 text-gray-700">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-4 px-5 text-gray-900">{item.petName}</td>
                  <td className="py-4 px-5 text-gray-900">{item.petType}</td>
                  <td className="py-4 px-5 text-gray-700">{item.petBreed}</td>
                  <td className="py-4 px-5 text-gray-700">
                    {item.petAge} year{item.petAge === 1 ? "" : "s"}
                  </td>

                  {/* STATUS BADGE */}
                  <td className="py-4 px-5">
                    {item.status === "available" ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1 w-fit">
                        Available
                        <span className="h-2 w-2 bg-yellow-500 rounded-full" />
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1 w-fit">
                        Adopted
                        <span className="h-2 w-2 bg-green-500 rounded-full" />
                      </span>
                    )}
                  </td>

                  {/* ACTION MENU */}
                  <td className="py-4 px-5 relative">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === item.id ? null : item.id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-xl"
                    >
                      <MoreHorizontal className="h-5 w-5 text-gray-700" />
                    </button>

                    {menuOpenId === item.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-5 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-md z-20"
                      >
                        <button
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() =>
                            router.push(
                              `/dashboard/adoption-list/view/${item.id}`,
                            )
                          }
                        >
                          View
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() =>
                            router.push(`/dashboard/adoption-list/${item.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                          onClick={() => openDeleteModal(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <p className="text-sm text-gray-600">
        No of Results {items.length} out of {items.length}
      </p>

      {isRefreshing ? (
        <p className="text-xs text-gray-500">Updating adoption list...</p>
      ) : null}

      {deleteError ? (
        <p className="text-xs text-red-600">{deleteError}</p>
      ) : null}

      {!isRefreshing && error && items.length > 0 ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : null}

      {/* PAGINATION */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 border border-gray-400 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`px-4 py-2 border border-gray-400 rounded-lg ${
              number === currentPage
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setPage(number)}
          >
            {number}
          </button>
        ))}

        <button
          className="p-2 border border-gray-400 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* DELETE MODAL */}
      {deleteOpen && (
        <ConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Adoption Record?"
          description="Deleting this pet will remove it from adoption list permanently."
          loading={deleteStatus === "loading"}
        />
      )}
    </div>
  );
}
