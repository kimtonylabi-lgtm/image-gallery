"use client";

import type { ImageItem, Category } from "@/types";
import ImageCard from "./image-card";

interface ImageGridProps {
  images: ImageItem[];
  categories: Category[];
  onImageClick: (image: ImageItem) => void;
}

export default function ImageGrid({ images, categories, onImageClick }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">이미지가 없습니다</p>
        <p className="text-sm mt-1">상단의 업로드 버튼을 눌러 이미지를 추가하세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          categories={categories}
          onClick={onImageClick}
        />
      ))}
    </div>
  );
}
