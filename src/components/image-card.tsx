"use client";

import type { ImageItem, Category } from "@/types";

interface ImageCardProps {
  image: ImageItem;
  categories: Category[];
  onClick: (image: ImageItem) => void;
}

export default function ImageCard({ image, categories, onClick }: ImageCardProps) {
  const categoryName =
    categories.find((c) => c.id === image.category)?.name ?? image.category;

  return (
    <div
      className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white"
      onClick={() => onClick(image)}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image.thumbnailData}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Info - always visible on mobile, hover on desktop */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 sm:p-3 sm:inset-0 sm:via-black/20 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
        <h3 className="text-white font-semibold text-xs sm:text-sm truncate">{image.title}</h3>
        <span className="text-white/80 text-[10px] sm:text-xs mt-0.5">{categoryName}</span>
        {image.description && (
          <p className="text-white/70 text-[10px] sm:text-xs mt-1 line-clamp-2 hidden sm:block">{image.description}</p>
        )}
      </div>
    </div>
  );
}
