"use client";

const MAX_THUMBNAIL_SIZE = 300;
const MAX_IMAGE_SIZE = 1200;

function resizeImage(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export async function createImageData(file: File) {
  // Firestore document limit is 1MB
  // thumbnail ~30KB, image ~400KB target
  const [imageData, thumbnailData] = await Promise.all([
    resizeImage(file, MAX_IMAGE_SIZE, 0.6),
    resizeImage(file, MAX_THUMBNAIL_SIZE, 0.5),
  ]);
  return { imageData, thumbnailData };
}
