export interface ImageItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  categoryId?: string;
}
