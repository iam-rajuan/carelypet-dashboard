"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUsers } from "../../store/usersSlice";

export default function PetPalPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const status = useAppSelector((state) => state.users.status);
  const error = useAppSelector((state) => state.users.error);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return users.slice(start, end);
  }, [users, currentPage, pageSize]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  return (
    <div className="space-y-8 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pet’s Pal</h1>
          <p className="text-gray-500 text-sm">
            This section will show superficial data of a user.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <input
              placeholder="Search username or name"
              className="w-64 md:w-80 px-4 py-2 pr-10 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A7C7]/40"
            />
            <Search className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" />
          </div>

          {/* EXPORT BUTTON */}
          <button className="flex items-center gap-2 bg-[#D6F2F8] hover:bg-[#c9edf5] px-5 py-2 rounded-xl text-sm text-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                NO.
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Pet Owner Name
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Username
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Email
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="py-3 px-5 text-sm font-medium text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {status === "loading" ? (
              <tr className="border-t border-gray-200">
                <td colSpan={6} className="py-6 px-5 text-center text-gray-600">
                  Loading users...
                </td>
              </tr>
            ) : status === "failed" ? (
              <tr className="border-t border-gray-200">
                <td colSpan={6} className="py-6 px-5 text-center text-red-600">
                  {error ?? "Failed to load users."}
                </td>
              </tr>
            ) : pagedUsers.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={6} className="py-6 px-5 text-center text-gray-600">
                  No users found.
                </td>
              </tr>
            ) : (
              pagedUsers.map((item, index) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="py-4 px-5 text-gray-700">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  <td className="py-4 px-5 text-gray-900">{item.name}</td>

                  <td className="py-4 px-5 text-gray-600">{item.username}</td>

                  <td className="py-4 px-5 text-gray-600">{item.email}</td>

                  <td className="py-4 px-5">
                    {item.status === "active" && !item.deletionRequestedAt ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1 w-fit">
                        Active{" "}
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1 w-fit">
                        Deletion Request{" "}
                        <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/pal-management/${item.id}`)
                      }
                      className="p-2 bg-[#D6F2F8] hover:bg-[#c9edf5] rounded-xl"
                    >
                      <Eye className="h-5 w-5 text-gray-700" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER SUMMARY */}
      <p className="text-sm text-gray-600">
        No of Results {users.length} out of {users.length}
      </p>

      {/* PAGINATION */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`px-4 py-2 border border-gray-200 rounded-lg ${
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
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
