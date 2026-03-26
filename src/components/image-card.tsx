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
          src={image.thumbnailUrl}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-white font-semibold text-sm truncate">{image.title}</h3>
        <span className="text-white/80 text-xs mt-0.5">{categoryName}</span>
        {image.description && (
          <p className="text-white/70 text-xs mt-1 line-clamp-2">{image.description}</p>
        )}
      </div>
    </div>
  );
}
