"use client";

import {
  Bug,
  Bone,
  FileText,
  Pill,
  Scissors,
  Stethoscope,
  Syringe,
  X,
} from "lucide-react";
import HealthRecordFormModal, {
  HealthRecordFormValues,
} from "./HealthRecordFormModal";
import { useState } from "react";

const types = [
  {
    label: "Vaccination",
    icon: Syringe,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Check-up",
    icon: Stethoscope,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Medication",
    icon: Pill,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    label: "Tick & Flea",
    icon: Bug,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Surgery",
    icon: Scissors,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    label: "Dental",
    icon: Bone,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    label: "Other",
    icon: FileText,
    iconBg: "bg-gray-200",
    iconColor: "text-gray-600",
  },
];

interface RecordTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (record: HealthRecordFormValues) => void;
}

export default function RecordTypeModal({
  open,
  onClose,
  onSave,
}: RecordTypeModalProps) {
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[380px] p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold text-gray-900">
              Select Record Type
            </p>
            <X className="cursor-pointer" onClick={onClose} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {types.map((t) => {
              const Icon = t.icon;
              return (
              <div
                key={t.label}
                onClick={() => {
                  setSelected(t.label);
                  setOpenForm(true);
                }}
                className={`border rounded-xl p-3 cursor-pointer hover:bg-gray-50 flex flex-col items-center`}
              >
                <span
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${t.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${t.iconColor}`} />
                </span>
                <p className="text-sm text-gray-800 mt-2">{t.label}</p>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {openForm && (
        <HealthRecordFormModal
          open={openForm}
          onClose={() => setOpenForm(false)}
          type={selected!}
          onSave={onSave}
        />
      )}
    </>
  );
}
