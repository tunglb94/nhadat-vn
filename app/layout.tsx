import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NhaDat.vn - Tìm là thấy, Giá là thật",
    template: "%s | NhaDat.vn",
  },
  description:
    "Trang mua bán, cho thuê bất động sản uy tín nhất Việt Nam. Tin đăng thật, giá minh bạch, tìm kiếm thông minh.",
  keywords: ["mua nhà", "bán nhà", "cho thuê nhà", "bất động sản", "căn hộ"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "NhaDat.vn",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        {/* pb-16 trên mobile để tránh bị bottom nav che */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
