import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trang chủ – Soumaki | Your Healthy Food Soulmate",
  description:
    "Cùng Soumaki khởi đầu hành trình lành mạnh, bắt đầu từ những bữa tròn vị, đủ chất, dành riêng cho bạn! Build your own healthy bowl & kiểm soát calo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-plum selection:text-cream">
        {children}
      </body>
    </html>
  );
}
