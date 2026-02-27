"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Download, Eye } from "lucide-react";

export type HealthRecordsModalAttachment = {
  id: string;
  name: string;
  type: string;
  file?: File;
  url?: string;
  sizeLabel?: string;
};

export type HealthRecordsModalRecord = {
  id: string;
  title: string;
  subtitle: string;
  attachments: HealthRecordsModalAttachment[];
};

type PreviewState = {
  name: string;
  type: string;
  url: string;
  sizeLabel: string;
  revokeUrl: boolean;
  file?: File;
};

type HealthRecordsModalProps = {
  open: boolean;
  title: string;
  records: HealthRecordsModalRecord[];
  onClose: () => void;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
};

export default function HealthRecordsModal({
  open,
  title,
  records,
  onClose,
}: HealthRecordsModalProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const closePreview = () => {
    if (preview?.revokeUrl) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  };

  const handleDownload = (attachment: HealthRecordsModalAttachment) => {
    if (attachment.url) {
      const link = document.createElement("a");
      link.href = attachment.url;
      link.download = attachment.name;
      link.click();
      return;
    }

    if (attachment.file) {
      const url = URL.createObjectURL(attachment.file);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const openPreview = (attachment: HealthRecordsModalAttachment) => {
    if (attachment.url) {
      setPreview({
        name: attachment.name,
        type: attachment.type,
        url: attachment.url,
        sizeLabel: attachment.sizeLabel ?? "",
        revokeUrl: false,
        file: undefined,
      });
      return;
    }

    if (attachment.file) {
      const url = URL.createObjectURL(attachment.file);
      setPreview({
        name: attachment.name,
        type: attachment.type,
        url,
        sizeLabel: attachment.sizeLabel ?? formatFileSize(attachment.file.size),
        revokeUrl: true,
        file: attachment.file,
      });
    }
  };

  useEffect(() => {
    if (!open) {
      setExpandedId(null);
      closePreview();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (preview?.revokeUrl) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const recordCountLabel = useMemo(() => {
    const count = records.length;
    return `${count} record${count === 1 ? "" : "s"}`;
  }, [records.length]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <p className="text-lg font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{recordCountLabel}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>

          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {records.length === 0 ? (
              <p className="text-sm text-gray-600">
                No records found for {title}.
              </p>
            ) : (
              records.map((record, index) => {
                const isOpen = expandedId === record.id;
                return (
                  <div
                    key={record.id}
                    className="border rounded-2xl bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isOpen ? null : record.id)
                      }
                      className="w-full px-4 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-900">
                            {record.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t px-5 py-4">
                        <p className="text-xs text-gray-500 font-medium mb-3">
                          Attachments
                        </p>
                        <div className="space-y-3">
                          {record.attachments.map((attachment) => {
                            const sizeLabel =
                              attachment.sizeLabel ??
                              (attachment.file
                                ? formatFileSize(attachment.file.size)
                                : "");
                            return (
                              <div
                                key={attachment.id}
                                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border rounded-xl px-4 py-3 bg-gray-50"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {attachment.type.toUpperCase()}
                                    {sizeLabel ? ` • ${sizeLabel}` : ""}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openPreview(attachment)}
                                    className="px-3 py-2 rounded-lg bg-white border text-xs font-medium text-gray-700 flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownload(attachment)}
                                    className="px-3 py-2 rounded-lg bg-[#D6F2F8] text-xs font-medium text-gray-800 flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {preview.name}
                </p>
                <p className="text-xs text-gray-500">
                  {preview.type.toUpperCase()}
                  {preview.sizeLabel ? ` • ${preview.sizeLabel}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="p-5">
              {preview.type.startsWith("image") ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-full max-h-[70vh] object-contain rounded-xl bg-gray-50"
                />
              ) : (
                <iframe
                  title={preview.name}
                  src={preview.url}
                  className="w-full h-[70vh] rounded-xl border bg-gray-50"
                />
              )}
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (preview.revokeUrl && preview.file) {
                    handleDownload({
                      id: preview.url,
                      name: preview.name,
                      type: preview.type,
                      file: preview.file,
                    });
                    return;
                  }
                  handleDownload({
                    id: preview.url,
                    name: preview.name,
                    type: preview.type,
                    url: preview.url,
                  });
                }}
                className="px-4 py-2 rounded-lg bg-[#D6F2F8] text-xs font-medium text-gray-800 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
