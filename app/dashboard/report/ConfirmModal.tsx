"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
};

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure you want to delete?",
  description = "By deleting this record, you won't be able to see it again. If you still want to continue press \"Delete\".",
  loading = false,
}: ConfirmModalProps): React.ReactElement | null {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-7 rounded-xl w-[360px] shadow-xl text-center">
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* TEXT */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        {/* BUTTONS */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
