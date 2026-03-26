"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageItem, Category } from "@/types";

const DB_NAME = "image-gallery-db";
const DB_VERSION = 1;
const IMAGES_STORE = "images";
const CATEGORIES_STORE = "categories";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "landscape", name: "풍경", order: 1 },
  { id: "people", name: "인물", order: 2 },
  { id: "food", name: "음식", order: 3 },
  { id: "etc", name: "기타", order: 4 },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        const imageStore = db.createObjectStore(IMAGES_STORE, { keyPath: "id" });
        imageStore.createIndex("category", "category", { unique: false });
        imageStore.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
        db.createObjectStore(CATEGORIES_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function initCategories(db: IDBDatabase): Promise<void> {
  const tx = db.transaction(CATEGORIES_STORE, "readonly");
  const store = tx.objectStore(CATEGORIES_STORE);
  const count = await new Promise<number>((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (count === 0) {
    const writeTx = db.transaction(CATEGORIES_STORE, "readwrite");
    const writeStore = writeTx.objectStore(CATEGORIES_STORE);
    for (const cat of DEFAULT_CATEGORIES) {
      writeStore.add(cat);
    }
    await new Promise<void>((resolve, reject) => {
      writeTx.oncomplete = () => resolve();
      writeTx.onerror = () => reject(writeTx.error);
    });
  }
}

function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putItem<T>(db: IDBDatabase, storeName: string, item: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function deleteItem(db: IDBDatabase, storeName: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useIndexedDB() {
  const dbRef = useRef<IDBDatabase | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = await openDB();
      if (cancelled) return;
      dbRef.current = db;
      await initCategories(db);
      const [imgs, cats] = await Promise.all([
        getAllFromStore<ImageItem>(db, IMAGES_STORE),
        getAllFromStore<Category>(db, CATEGORIES_STORE),
      ]);
      if (cancelled) return;
      setImages(imgs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setCategories(cats.sort((a, b) => a.order - b.order));
      setIsReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const addImage = useCallback(async (image: ImageItem) => {
    if (!dbRef.current) return;
    await putItem(dbRef.current, IMAGES_STORE, image);
    setImages((prev) => [image, ...prev]);
  }, []);

  const updateImage = useCallback(async (image: ImageItem) => {
    if (!dbRef.current) return;
    await putItem(dbRef.current, IMAGES_STORE, image);
    setImages((prev) => prev.map((img) => (img.id === image.id ? image : img)));
  }, []);

  const removeImage = useCallback(async (id: string) => {
    if (!dbRef.current) return;
    await deleteItem(dbRef.current, IMAGES_STORE, id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    if (!dbRef.current) return;
    await putItem(dbRef.current, CATEGORIES_STORE, category);
    setCategories((prev) => [...prev, category].sort((a, b) => a.order - b.order));
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    if (!dbRef.current) return;
    await deleteItem(dbRef.current, CATEGORIES_STORE, id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    // Move images in deleted category to "etc"
    const affectedImages = images.filter((img) => img.category === id);
    for (const img of affectedImages) {
      const updated = { ...img, category: "etc", updatedAt: new Date().toISOString() };
      await putItem(dbRef.current, IMAGES_STORE, updated);
    }
    if (affectedImages.length > 0) {
      setImages((prev) =>
        prev.map((img) =>
          img.category === id ? { ...img, category: "etc", updatedAt: new Date().toISOString() } : img
        )
      );
    }
  }, [images]);

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
