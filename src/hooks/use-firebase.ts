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
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
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

  // Initialize categories if empty + realtime subscription
  useEffect(() => {
    let unsubImages: () => void;
    let unsubCategories: () => void;

    const init = async () => {
      // Check if categories exist, if not seed defaults
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

      // Realtime listener for categories
      const catQuery = query(collection(db, "categories"), orderBy("order"));
      unsubCategories = onSnapshot(catQuery, (snapshot) => {
        const cats: Category[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          order: doc.data().order,
          categoryId: doc.data().categoryId,
        })) as (Category & { categoryId?: string })[];
        setCategories(cats);
      });

      // Realtime listener for images
      const imgQuery = query(collection(db, "images"), orderBy("createdAt", "desc"));
      unsubImages = onSnapshot(imgQuery, (snapshot) => {
        const imgs: ImageItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      // Upload images to Firebase Storage
      const imageRef = ref(storage, `images/${id}/full`);
      const thumbRef = ref(storage, `images/${id}/thumb`);

      await uploadString(imageRef, imageData, "data_url");
      await uploadString(thumbRef, thumbnailData, "data_url");

      const imageUrl = await getDownloadURL(imageRef);
      const thumbnailUrl = await getDownloadURL(thumbRef);

      // Save metadata to Firestore
      await addDoc(collection(db, "images"), {
        title: title || "Untitled",
        description,
        category,
        imageUrl,
        thumbnailUrl,
        storagePath: `images/${id}`,
        createdAt: now,
        updatedAt: now,
      });
    },
    []
  );

  const updateImage = useCallback(
    async (image: ImageItem) => {
      const docRef = doc(db, "images", image.id);
      await updateDoc(docRef, {
        title: image.title,
        description: image.description,
        category: image.category,
        updatedAt: new Date().toISOString(),
      });
    },
    []
  );

  const removeImage = useCallback(async (image: ImageItem) => {
    // Delete from Storage
    const storagePath = (image as ImageItem & { storagePath?: string }).storagePath;
    if (storagePath) {
      try {
        await deleteObject(ref(storage, `${storagePath}/full`));
        await deleteObject(ref(storage, `${storagePath}/thumb`));
      } catch {
        // Storage files may already be deleted
      }
    }
    // Delete from Firestore
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
      // Move images in deleted category to "etc"
      const etcCat = categories.find((c) => (c as Category & { categoryId?: string }).categoryId === "etc" || c.name === "기타");
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
