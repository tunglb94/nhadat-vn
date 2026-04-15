"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-black tracking-tighter text-brand-600">NhaDat</span>
            <span className="text-2xl font-black tracking-tighter text-brand-dark">.vn</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/tim-kiem?type=BAN" active={pathname.includes("BAN")}>Mua nhà</NavLink>
            <NavLink href="/tim-kiem?type=THUE" active={pathname.includes("THUE")}>Thuê nhà</NavLink>
            <NavLink href="/dinh-gia" active={pathname === "/dinh-gia"}>Định giá</NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dang-nhap" className="hidden md:block text-sm font-semibold text-gray-600 hover:text-brand-600">
              Đăng nhập
            </Link>
            <Link
              href="/dang-tin"
              className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-all active:scale-95 shadow-soft"
            >
              + Đăng tin
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - App Style */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 md:hidden pb-safe">
        <div className="grid grid-cols-5 h-16 items-center">
          <BottomTab href="/" label="Trang chủ" active={pathname === "/"} 
            icon={<path d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />} />
          
          <BottomTab href="/tim-kiem?type=BAN" label="Mua bán" active={pathname.includes("BAN")}
            icon={<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />} />

          {/* Floating Action Button for Posting */}
          <Link href="/dang-tin" className="flex flex-col items-center -mt-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-fab text-white active:scale-90 transition-transform border-4 border-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-brand-600 mt-1">Đăng tin</span>
          </Link>

          <BottomTab href="/tim-kiem?type=THUE" label="Cho thuê" active={pathname.includes("THUE")}
            icon={<path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />} />
          
          <BottomTab href="/quan-ly" label="Cá nhân" active={pathname.includes("quan-ly")}
            icon={<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />} />
        </div>
      </nav>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`text-sm font-semibold transition-colors ${active ? "text-brand-600" : "text-gray-500 hover:text-brand-dark"}`}>
      {children}
    </Link>
  );
}

function BottomTab({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? "text-brand-600" : "text-gray-400"}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}