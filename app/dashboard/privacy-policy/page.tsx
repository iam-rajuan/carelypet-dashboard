"use client";

import { useCallback, useEffect, useState } from "react";
import RichTextEditor from "../../components/RichTextEditor";
import { useAppSelector } from "../../store/hooks";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  const fetchPrivacy = useCallback(async () => {
    if (!normalizedBaseUrl) {
      setStatus("failed");
      setError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }
    if (!accessToken) {
      setStatus("failed");
      setError("Missing access token.");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/settings/privacy`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to fetch privacy policy.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const nextContent = data?.data?.content ?? "";
      setContent(nextContent);
      setOriginalContent(nextContent);
      setUpdatedAt(data?.data?.updatedAt ?? null);
      setStatus("succeeded");
    } catch (err) {
      setStatus("failed");
      setError(
        err instanceof Error ? err.message : "Failed to fetch privacy policy.",
      );
    }
  }, [accessToken, normalizedBaseUrl]);

  useEffect(() => {
    if (status === "idle") {
      void fetchPrivacy();
    }
  }, [fetchPrivacy, status]);

  const handleSave = async () => {
    if (!normalizedBaseUrl) {
      setSaveStatus("failed");
      setSaveError("NEXT_PUBLIC_API_BASE_URL is not set.");
      return;
    }
    if (!accessToken) {
      setSaveStatus("failed");
      setSaveError("Missing access token.");
      return;
    }

    setSaveStatus("loading");
    setSaveError(null);
    try {
      const response = await fetch(
        `${normalizedBaseUrl}/admin/settings/privacy`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) {
        let message = "Failed to save privacy policy.";
        try {
          const errorBody = await response.json();
          message = errorBody?.message ?? message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      setOriginalContent(data?.content ?? content);
      setSaveStatus("succeeded");
      await fetchPrivacy();
    } catch (err) {
      setSaveStatus("failed");
      setSaveError(
        err instanceof Error ? err.message : "Failed to save privacy policy.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-600">
          Update the privacy policy shown to users across the platform.
        </p>
        {updatedAt ? (
          <p className="text-xs text-gray-500 mt-1">
            Last updated {new Date(updatedAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      {status === "loading" ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
          Loading privacy policy...
        </div>
      ) : status === "failed" ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-red-600">
          {error ?? "Failed to load privacy policy."}
        </div>
      ) : (
        <RichTextEditor value={content} onChange={setContent} />
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={status === "loading" || saveStatus === "loading"}
          onClick={() => setContent(originalContent)}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={
            status === "loading" ||
            saveStatus === "loading" ||
            content === originalContent
          }
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-[#D6F2F8] hover:bg-[#c9edf5] text-gray-800 font-medium"
        >
          {saveStatus === "loading" ? "Saving..." : "Save changes"}
        </button>
      </div>
      {saveStatus === "failed" && saveError ? (
        <p className="text-sm text-red-600">{saveError}</p>
      ) : null}
    </div>
  );
}
