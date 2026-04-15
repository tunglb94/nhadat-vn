"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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

          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? ""}
                      width={30}
                      height={30}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-[30px] h-[30px] rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-black">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      <div className="py-1">
                        <DropdownLink href="/quan-ly" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Quản lý tin đăng
                        </DropdownLink>
                        <DropdownLink href="/dang-tin" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Đăng tin mới
                        </DropdownLink>
                      </div>
                      <div className="py-1 border-t border-gray-50">
                        <button
                          onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/dang-nhap" className="hidden md:block text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">
                Đăng nhập
              </Link>
            )}

            <Link
              href="/dang-tin"
              className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-all active:scale-95 shadow-soft"
            >
              + Đăng tin
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 md:hidden pb-safe">
        <div className="grid grid-cols-5 h-16 items-center">
          <BottomTab href="/" label="Trang chủ" active={pathname === "/"}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/" ? 2.5 : 1.5} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />} />

          <BottomTab href="/tim-kiem?type=BAN" label="Mua bán" active={pathname.includes("BAN")}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.includes("BAN") ? 2.5 : 1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />} />

          {/* FAB Đăng tin */}
          <Link href="/dang-tin" className="flex flex-col items-center -mt-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-fab text-white active:scale-90 transition-transform border-4 border-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-brand-600 mt-1">Đăng tin</span>
          </Link>

          <BottomTab href="/tim-kiem?type=THUE" label="Cho thuê" active={pathname.includes("THUE")}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.includes("THUE") ? 2.5 : 1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />} />

          {session?.user ? (
            <Link href="/quan-ly" className={`flex flex-col items-center justify-center gap-1 transition-all ${pathname.includes("quan-ly") ? "text-brand-600" : "text-gray-400"}`}>
              {session.user.image ? (
                <Image src={session.user.image} alt="" width={24} height={24} className="rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-[10px] font-black">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[10px] font-bold">Cá nhân</span>
            </Link>
          ) : (
            <BottomTab href="/dang-nhap" label="Đăng nhập" active={pathname === "/dang-nhap"}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/dang-nhap" ? 2.5 : 1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />} />
          )}
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

function DropdownLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  );
}
