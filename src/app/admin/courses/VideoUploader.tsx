"use client";

import { useState, useRef } from "react";

export default function VideoUploader({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const [videoUrl, setVideoUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file (MP4, MOV, etc.)");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError("File too large. Maximum size is 500MB.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        setProgress("");
        return;
      }

      setVideoUrl(data.url);
      setProgress("");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setVideoUrl("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const isYouTubeOrVimeo =
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be") ||
    videoUrl.includes("vimeo.com");

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">videocam</span>
          Course Video
        </span>
      </label>

      {/* Hidden input to submit the URL with the form */}
      <input type="hidden" name="video_url" value={videoUrl} />

      {/* Current video preview */}
      {videoUrl && (
        <div className="mb-3 bg-gray-50 border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              Video Set
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-700 font-bold uppercase cursor-pointer"
            >
              Remove
            </button>
          </div>
          <p className="text-xs text-gray-500 truncate">{videoUrl}</p>
          {isYouTubeOrVimeo && (
            <span className="inline-block mt-1 text-[10px] font-bold uppercase px-1.5 py-0.5 bg-red-50 text-red-600">
              {videoUrl.includes("vimeo") ? "Vimeo" : "YouTube"}
            </span>
          )}
          {!isYouTubeOrVimeo && videoUrl && (
            <span className="inline-block mt-1 text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-600">
              Uploaded MP4
            </span>
          )}
        </div>
      )}

      {/* Upload or Paste */}
      <div className="space-y-3">
        {/* File upload */}
        <div>
          <div
            className={`border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors p-4 text-center ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <span className="material-symbols-outlined text-3xl text-gray-300 mb-1 block">
              cloud_upload
            </span>
            <p className="text-sm font-medium text-gray-500">
              {uploading ? progress : "Click to upload MP4 video"}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              MP4, MOV — max 500MB
            </p>
            {uploading && (
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse w-full" />
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            or paste a link
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* URL input */}
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
        />
        <p className="text-xs text-gray-400">
          Supports YouTube, Vimeo, or direct video URLs.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
