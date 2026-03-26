"use client";

import { useState, useRef, useCallback } from "react";
import type { Category } from "@/types";
import { createImageData } from "@/hooks/use-image-resize";

interface UploadModalProps {
  categories: Category[];
  onUpload: (imageData: string, thumbnailData: string, title: string, description: string, category: string) => Promise<void>;
  onClose: () => void;
}

interface PendingFile {
  file: File;
  preview: string;
  title: string;
  description: string;
  category: string;
}

export default function UploadModal({ categories, onUpload, onClose }: UploadModalProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const newPending = imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        category: categories[0]?.id ?? "etc",
      }));
      setPendingFiles((prev) => [...prev, ...newPending]);
    },
    [categories]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const updatePending = (index: number, updates: Partial<PendingFile>) => {
    setPendingFiles((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadAll = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < pendingFiles.length; i++) {
      const pending = pendingFiles[i];
      const { imageData, thumbnailData } = await createImageData(pending.file);
      await onUpload(
        imageData,
        thumbnailData,
        pending.title || "Untitled",
        pending.description,
        pending.category
      );
      URL.revokeObjectURL(pending.preview);
      setUploadProgress(i + 1);
    }

    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">이미지 업로드</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 font-medium">이미지를 드래그하거나 클릭하여 선택</p>
            <p className="text-gray-400 text-sm mt-1">JPG, PNG, GIF, WebP 지원</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-600">
                선택된 파일 ({pendingFiles.length}개)
              </h3>
              {pendingFiles.map((pending, index) => (
                <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={pending.preview}
                    alt={pending.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      value={pending.title}
                      onChange={(e) => updatePending(index, { title: e.target.value })}
                      placeholder="제목"
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      value={pending.description}
                      onChange={(e) => updatePending(index, { description: e.target.value })}
                      placeholder="설명 (선택)"
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <select
                      value={pending.category}
                      onChange={(e) => updatePending(index, { category: e.target.value })}
                      className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removePending(index)}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0 cursor-pointer"
                    title="제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {pendingFiles.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            {isUploading && (
              <span className="text-sm text-gray-500 mr-auto">
                {uploadProgress}/{pendingFiles.length} 업로드 중...
              </span>
            )}
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploading ? "업로드 중..." : `${pendingFiles.length}개 업로드`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
