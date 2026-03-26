"use client";

import { useState } from "react";
import type { Category } from "@/types";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
  onAdd: (category: Category) => void;
  onRemove: (categoryId: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
  onAdd,
  onRemove,
}: CategoryTabsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    onAdd({ id, name, order: categories.length + 1 });
    setNewName("");
    setIsAdding(false);
  };

  const tabBase =
    "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer";
  const tabActive = "bg-white text-blue-600 border border-b-0 border-gray-200";
  const tabInactive = "text-gray-500 hover:text-gray-700 hover:bg-gray-50";

  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-gray-200 pb-0 scrollbar-hide">
      <button
        onClick={() => onSelect("all")}
        className={`${tabBase} ${activeCategory === "all" ? tabActive : tabInactive}`}
      >
        전체
      </button>

      {categories.map((cat) => (
        <div key={cat.id} className="group relative flex items-center">
          <button
            onClick={() => onSelect(cat.id)}
            className={`${tabBase} ${activeCategory === cat.id ? tabActive : tabInactive} pr-7`}
          >
            {cat.name}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 이미지는 "기타"로 이동됩니다.`)) {
                onRemove(cat.id);
                if (activeCategory === cat.id) onSelect("all");
              }
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs transition-opacity cursor-pointer"
            title="카테고리 삭제"
          >
            ✕
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-1 px-2 py-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewName("");
              }
            }}
            placeholder="카테고리명"
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={handleAdd}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer"
          >
            추가
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewName("");
            }}
            className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`${tabBase} ${tabInactive} border border-dashed border-gray-300`}
          title="카테고리 추가"
        >
          + 추가
        </button>
      )}
    </div>
  );
}
