import type { Metadata } from "next";
import "./globals.css";
import "./product.css";

export const metadata: Metadata = {
  title: "밝은세상안과 | AI 인용 모니터링",
  description: "사이트·국가·키워드별 AI 인용을 주간 단위로 확인하세요.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/brand.svg",
    shortcut: "/brand.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
