import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이미지 갤러리",
  description: "이미지를 업로드하고 카테고리별로 관리하는 갤러리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
