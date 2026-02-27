"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

type ActionType = "delete" | "remove" | "warn" | "dismiss";

interface ActionMenuProps {
  reportId: string;
  onDeleteClick: (type: ActionType, id: string) => void;
}

export default function ActionMenu({
  reportId,
  onDeleteClick,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
      >
        <MoreHorizontal className="h-5 w-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow-xl w-44 py-2 z-[9999]">
          <Link
            href={`/dashboard/report/${reportId}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            View
          </Link>

          <button
            onClick={() => onDeleteClick("delete", reportId)}
            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
          >
            Delete
          </button>

          <hr className="my-1" />

          <button
            onClick={() => onDeleteClick("remove", reportId)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Remove Content
          </button>

          <button
            onClick={() => onDeleteClick("warn", reportId)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Warn User
          </button>

          <button
            onClick={() => onDeleteClick("dismiss", reportId)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Dismiss Report
          </button>
        </div>
      )}
    </div>
  );
}
