export interface ImageItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageData: string;
  thumbnailData: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}
