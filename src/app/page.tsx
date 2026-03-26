"use client";

import { useState, useMemo } from "react";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import CategoryTabs from "@/components/category-tabs";
import ImageGrid from "@/components/image-grid";
import UploadModal from "@/components/upload-modal";
import ImageDetailModal from "@/components/image-detail-modal";
import type { ImageItem } from "@/types";

export default function Home() {
  const {
    images,
    categories,
    isReady,
    addImage,
    updateImage,
    removeImage,
    addCategory,
    removeCategory,
  } = useIndexedDB();

  const [activeCategory, setActiveCategory] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const filteredImages = useMemo(
    () =>
      activeCategory === "all"
        ? images
        : images.filter((img) => img.category === activeCategory),
    [images, activeCategory]
  );

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            <span className="text-blue-500">Image</span> Gallery
          </h1>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            업로드
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Category tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          onAdd={addCategory}
          onRemove={removeCategory}
        />

        {/* Image count */}
        <div className="mt-4 mb-4 text-sm text-gray-500">
          {filteredImages.length}개의 이미지
        </div>

        {/* Grid */}
        <ImageGrid
          images={filteredImages}
          categories={categories}
          onImageClick={setSelectedImage}
        />
      </main>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          categories={categories}
          onUpload={addImage}
          onClose={() => setShowUpload(false)}
        />
      )}

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          categories={categories}
          onUpdate={(updated) => {
            updateImage(updated);
            setSelectedImage(updated);
          }}
          onDelete={(id) => {
            removeImage(id);
            setSelectedImage(null);
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
