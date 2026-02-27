"use client";

import { ChangeEvent, useRef, useState } from "react";
import { X, Upload } from "lucide-react";

interface HealthRecordFormModalProps {
  open: boolean;
  onClose: () => void;
  type: string;
  onSave: (record: HealthRecordFormValues) => void;
}

export interface HealthRecordFormValues {
  type: string;
  recordName: string;
  batchNumber: string;
  otherInfo: string;
  cost: string;
  date: string;
  nextDueDate: string;
  vetDesignation: string;
  vetName: string;
  clinicName: string;
  licenseNumber: string;
  contact: string;
  weight: string;
  temperature: string;
  heartRate: string;
  respiratory: string;
  status: string;
  attachments: File[];
}

export default function HealthRecordFormModal({
  open,
  onClose,
  type,
  onSave,
}: HealthRecordFormModalProps) {
  const [recordName, setRecordName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [vetDesignation, setVetDesignation] = useState("");
  const [vetName, setVetName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [contact, setContact] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratory, setRespiratory] = useState("");
  const [status, setStatus] = useState("normal");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSizeBytes = 15 * 1024 * 1024;

  if (!open) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    return `${(kb / 1024).toFixed(1)}MB`;
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const oversizeFiles = files.filter((file) => file.size > maxFileSizeBytes);
    const allowedFiles = files.filter((file) => file.size <= maxFileSizeBytes);
    const next = [...attachments, ...allowedFiles].slice(0, 3);
    const errors: string[] = [];

    if (oversizeFiles.length) {
      errors.push("Each attachment must be 15MB or less.");
    }
    if (attachments.length + allowedFiles.length > 3) {
      errors.push("You can upload up to 3 attachments.");
    }

    setAttachmentError(errors.length ? errors.join(" ") : null);

    setAttachments(next);
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    if (attachments.length < 1 || attachments.length > 3) {
      setAttachmentError("Attach between 1 and 3 files.");
      return;
    }
    if (attachments.some((file) => file.size > maxFileSizeBytes)) {
      setAttachmentError("Each attachment must be 15MB or less.");
      return;
    }

    setAttachmentError(null);
    onSave({
      type,
      recordName,
      batchNumber,
      otherInfo,
      cost,
      date,
      nextDueDate,
      vetDesignation,
      vetName,
      clinicName,
      licenseNumber,
      contact,
      weight,
      temperature,
      heartRate,
      respiratory,
      status,
      attachments,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-[900px] p-8 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <p className="text-xl font-semibold text-gray-900">
            Add {type} Record
          </p>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* RECORD DETAILS */}
        <p className="text-gray-900 font-medium mb-2">Record Details</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            className="input"
            placeholder="Record Name"
            value={recordName}
            onChange={(event) => setRecordName(event.target.value)}
          />
          <input
            className="input"
            placeholder="Batch / Lot No."
            value={batchNumber}
            onChange={(event) => setBatchNumber(event.target.value)}
          />
          <input
            className="input"
            placeholder="Other information"
            value={otherInfo}
            onChange={(event) => setOtherInfo(event.target.value)}
          />
          <input
            className="input"
            placeholder="Cost"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
          />
          <input
            className="input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <input
            className="input"
            type="date"
            value={nextDueDate}
            onChange={(event) => setNextDueDate(event.target.value)}
          />
        </div>

        {/* VETERINARIAN INFO */}
        <p className="text-gray-900 font-medium mb-2">
          Veterinarian Information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <input
            className="input"
            placeholder="Designation"
            value={vetDesignation}
            onChange={(event) => setVetDesignation(event.target.value)}
          />
          <input
            className="input"
            placeholder="Name"
            value={vetName}
            onChange={(event) => setVetName(event.target.value)}
          />
          <input
            className="input"
            placeholder="Clinic Name"
            value={clinicName}
            onChange={(event) => setClinicName(event.target.value)}
          />
          <input
            className="input"
            placeholder="License No"
            value={licenseNumber}
            onChange={(event) => setLicenseNumber(event.target.value)}
          />
          <input
            className="input"
            placeholder="Contact"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
        </div>

        {/* VITAL SIGNS */}
        <p className="text-gray-900 font-medium mb-2">Vital Signs</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <input
            className="input"
            placeholder="Weight"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <input
            className="input"
            placeholder="Temperature"
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
          />
          <input
            className="input"
            placeholder="Heart Rate"
            value={heartRate}
            onChange={(event) => setHeartRate(event.target.value)}
          />
          <input
            className="input"
            placeholder="Respiratory"
            value={respiratory}
            onChange={(event) => setRespiratory(event.target.value)}
          />
          <select
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* ATTACHMENTS */}
        <p className="text-gray-900 font-medium mb-2">Attachments</p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-[#D6F2F8] mb-3 rounded-xl"
        >
          <Upload className="h-4 w-4 text-gray-700" />
          Upload files
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />

        {attachmentError && (
          <p className="text-xs text-red-500 mb-3">{attachmentError}</p>
        )}

        {attachments.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="border rounded-xl px-4 py-3 mb-3 flex justify-between items-center bg-gray-50"
          >
            <div>
              <p className="text-gray-800 font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {file.type || "File"} • {formatFileSize(file.size)}
              </p>
            </div>
            <X
              className="text-gray-600 cursor-pointer"
              onClick={() => removeAttachment(index)}
            />
          </div>
        ))}

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-[#D6F2F8] rounded-xl hover:bg-[#c9edf5] text-gray-800 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
