"use client";

import { useMemo, useState } from "react";
import {
  Bug,
  ChevronRight,
  FileText,
  Bone,
  Pill,
  Plus,
  Scissors,
  Stethoscope,
  Syringe,
} from "lucide-react";
import RecordTypeModal from "./RecordTypeModal";
import { HealthRecordFormValues } from "./HealthRecordFormModal";
import HealthRecordsModal, {
  HealthRecordsModalRecord,
} from "../components/HealthRecordsModal";

const recordTypes = [
  {
    title: "Vaccination",
    count: 12,
    icon: Syringe,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Check-up",
    count: 12,
    icon: Stethoscope,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Medication",
    count: 12,
    icon: Pill,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Tick & Flea",
    count: 12,
    icon: Bug,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Surgery",
    count: 12,
    icon: Scissors,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    title: "Dental",
    count: 12,
    icon: Bone,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Other",
    count: 12,
    icon: FileText,
    iconBg: "bg-gray-200",
    iconColor: "text-gray-600",
  },
];

interface HealthRecordsSectionProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  records?: HealthRecordFormValues[];
  onAddRecord?: (record: HealthRecordFormValues) => void;
}

export default function HealthRecordsSection({
  title = "Add Health Records",
  description = `Click on "Add Health Record" and select which record you want to put. You can skip this section if you have no data or idea.`,
  actionLabel = "Add Health Record",
  records = [],
  onAddRecord,
}: HealthRecordsSectionProps) {
  const [openTypeModal, setOpenTypeModal] = useState(false);
  const [viewType, setViewType] = useState<string | null>(null);
  const recordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((record) => {
      counts[record.type] = (counts[record.type] ?? 0) + 1;
    });
    return counts;
  }, [records]);

  const handleSaveRecord = (record: HealthRecordFormValues) => {
    onAddRecord?.(record);
    setOpenTypeModal(false);
  };

  const recordsForView: HealthRecordsModalRecord[] = viewType
    ? records
        .filter((record) => record.type === viewType)
        .map((record, index) => ({
          id: `${record.type}-${index}`,
          title: record.recordName || record.type,
          subtitle: `${record.attachments.length} attachment${
            record.attachments.length === 1 ? "" : "s"
          }`,
          attachments: record.attachments.map((file, fileIndex) => ({
            id: `${record.type}-${index}-${fileIndex}`,
            name: file.name,
            type: file.type || "File",
            file,
          })),
        }))
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpenTypeModal(true)}
          className="px-4 py-2 bg-[#D6F2F8] hover:bg-[#c9edf5] rounded-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4 text-gray-700" />
          <span className="text-gray-800 font-medium">{actionLabel}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recordTypes.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-3">
                  <p className="text-xs text-gray-500">{item.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {recordCounts[item.title] ?? 0}
                  </p>
                </div>
                <span
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${item.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewType(item.title);
                }}
                className="mt-4 w-full bg-white text-gray-600 text-sm font-medium rounded-full py-2 flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-100"
              >
                View <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {records.length > 0 && (
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-800">
            Added health records
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {records.map((record, index) => (
              <span
                key={`${record.type}-${index}`}
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
              >
                {record.type} • {record.attachments.length} files
              </span>
            ))}
          </div>
        </div>
      )}

      {openTypeModal && (
        <RecordTypeModal
          open={openTypeModal}
          onClose={() => setOpenTypeModal(false)}
          onSave={handleSaveRecord}
        />
      )}

      <HealthRecordsModal
        open={Boolean(viewType)}
        title={`${viewType ?? ""} Records`}
        records={recordsForView}
        onClose={() => setViewType(null)}
      />
    </div>
  );
}
