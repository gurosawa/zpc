import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "zkTLS Master Guide",
  description: "프라이버시 보호 증명과 검증 가능한 TLS 연산을 배우는 인터랙티브 문서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
