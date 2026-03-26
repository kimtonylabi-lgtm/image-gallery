"use client";

import { useState } from "react";
import type { ImageItem, Category } from "@/types";

interface ImageDetailModalProps {
  image: ImageItem;
  categories: Category[];
  onUpdate: (image: ImageItem) => void;
  onDelete: (image: ImageItem) => void;
  onClose: () => void;
}

export default function ImageDetailModal({
  image,
  categories,
  onUpdate,
  onDelete,
  onClose,
}: ImageDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description);
  const [category, setCategory] = useState(image.category);

  const categoryName =
    categories.find((c) => c.id === image.category)?.name ?? image.category;

  const handleSave = () => {
    onUpdate({
      ...image,
      title: title.trim() || "Untitled",
      description: description.trim(),
      category,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("이 이미지를 삭제하시겠습니까?")) {
      onDelete(image);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 sm:p-4" onClick={onClose}>
      <div
        className="bg-white sm:rounded-xl rounded-t-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="md:w-2/3 bg-gray-900 flex items-center justify-center min-h-[200px] sm:min-h-[300px] md:min-h-0">
          <img
            src={image.imageData}
            alt={image.title}
            className="max-w-full max-h-[40vh] sm:max-h-[60vh] md:max-h-[90vh] object-contain"
          />
        </div>

        {/* Info panel */}
        <div className="md:w-1/3 flex flex-col md:min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500">상세 정보</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer">
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">제목</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{image.title}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                    {categoryName}
                  </span>
                </div>
                {image.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{image.description}</p>
                )}
                <div className="text-xs text-gray-400 space-y-1">
                  <p>업로드: {formatDate(image.createdAt)}</p>
                  {image.updatedAt !== image.createdAt && (
                    <p>수정: {formatDate(image.updatedAt)}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-gray-200 flex gap-2 pb-[env(safe-area-inset-bottom,12px)]">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(image.title);
                    setDescription(image.description);
                    setCategory(image.category);
                  }}
                  className="flex-1 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-lg cursor-pointer"
                >
                  저장
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg cursor-pointer"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg cursor-pointer"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
