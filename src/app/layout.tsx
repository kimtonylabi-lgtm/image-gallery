import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "티제이플라텍 제작명판 샘플",
  description: "티제이플라텍 제작명판 샘플 갤러리",
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
