"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ImageItem, Category } from "@/types";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "landscape", name: "풍경", order: 1 },
  { id: "people", name: "인물", order: 2 },
  { id: "food", name: "음식", order: 3 },
  { id: "etc", name: "기타", order: 4 },
];

export function useFirebase() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubImages: () => void;
    let unsubCategories: () => void;

    const init = async () => {
      const catSnapshot = await getDocs(collection(db, "categories"));
      if (catSnapshot.empty) {
        for (const cat of DEFAULT_CATEGORIES) {
          await addDoc(collection(db, "categories"), {
            name: cat.name,
            order: cat.order,
            categoryId: cat.id,
          });
        }
      }

      const catQuery = query(collection(db, "categories"), orderBy("order"));
      unsubCategories = onSnapshot(catQuery, (snapshot) => {
        const cats: Category[] = snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          order: d.data().order,
          categoryId: d.data().categoryId,
        }));
        setCategories(cats);
      });

      const imgQuery = query(collection(db, "images"), orderBy("createdAt", "desc"));
      unsubImages = onSnapshot(imgQuery, (snapshot) => {
        const imgs: ImageItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ImageItem[];
        setImages(imgs);
        setIsReady(true);
      });
    };

    init();

    return () => {
      unsubImages?.();
      unsubCategories?.();
    };
  }, []);

  const addImage = useCallback(
    async (imageData: string, thumbnailData: string, title: string, description: string, category: string) => {
      const now = new Date().toISOString();
      await addDoc(collection(db, "images"), {
        title: title || "Untitled",
        description,
        category,
        imageData,
        thumbnailData,
        createdAt: now,
        updatedAt: now,
      });
    },
    []
  );

  const updateImage = useCallback(async (image: ImageItem) => {
    const docRef = doc(db, "images", image.id);
    await updateDoc(docRef, {
      title: image.title,
      description: image.description,
      category: image.category,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const removeImage = useCallback(async (image: ImageItem) => {
    await deleteDoc(doc(db, "images", image.id));
  }, []);

  const addCategory = useCallback(async (name: string, order: number) => {
    const categoryId = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    await addDoc(collection(db, "categories"), {
      name,
      order,
      categoryId,
    });
  }, []);

  const removeCategory = useCallback(
    async (id: string) => {
      const etcCat = categories.find((c) => c.categoryId === "etc" || c.name === "기타");
      const etcId = etcCat?.id;

      if (etcId) {
        const affectedImages = images.filter((img) => img.category === id);
        for (const img of affectedImages) {
          await updateDoc(doc(db, "images", img.id), {
            category: etcId,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      await deleteDoc(doc(db, "categories", id));
    },
    [categories, images]
  );

  return {
    images,
    categories,
    isReady,
    addImage,
    updateImage,
    removeImage,
    addCategory,
    removeCategory,
  };
}
