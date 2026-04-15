import Link from "next/link";

const NAV_COLS = [
  {
    title: "Mua bán",
    links: [
      { href: "/tim-kiem?type=BAN&propertyType=NHA_PHO",  label: "Nhà phố" },
      { href: "/tim-kiem?type=BAN&propertyType=CAN_HO",   label: "Căn hộ" },
      { href: "/tim-kiem?type=BAN&propertyType=BIET_THU", label: "Biệt thự" },
      { href: "/tim-kiem?type=BAN&propertyType=DAT_NEN",  label: "Đất nền" },
    ],
  },
  {
    title: "Cho thuê",
    links: [
      { href: "/tim-kiem?type=THUE&propertyType=CAN_HO",    label: "Căn hộ" },
      { href: "/tim-kiem?type=THUE&propertyType=NHA_PHO",   label: "Nhà nguyên căn" },
      { href: "/tim-kiem?type=THUE&propertyType=PHONG_TRO", label: "Phòng trọ" },
      { href: "/tim-kiem?type=THUE&propertyType=MAT_BANG",  label: "Mặt bằng" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/dang-tin",  label: "Đăng tin miễn phí" },
      { href: "/dinh-gia",  label: "Định giá nhà" },
      { href: "/lien-he",   label: "Liên hệ" },
      { href: "/chinh-sach",label: "Chính sách" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">

      {/* ── Mobile: 1 dòng gọn — bottom nav đã lo navigation ── */}
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <span className="font-black text-sm tracking-tight">
          <span className="text-brand-600">NhaDat</span>
          <span className="text-gray-800">.vn</span>
        </span>
        <span className="text-[11px] text-gray-400">© 2025 · Tin đăng thật</span>
      </div>

      {/* ── Desktop: full footer ── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <p className="font-black text-2xl tracking-tight mb-4">
              <span className="text-brand-600">NhaDat</span>
              <span className="text-brand-dark">.vn</span>
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
              Nền tảng bất động sản minh bạch số 1 Việt Nam. Mọi tin đăng đều được xác thực GPS và kiểm tra giá tự động.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {["✅ Tin đăng thật", "📍 Xác thực GPS", "🎁 Miễn phí"].map(b => (
                <span key={b} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full border border-gray-100">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-black text-brand-dark mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <p>© 2025 NhaDat.vn. Nền tảng bất động sản minh bạch.</p>
          <div className="flex gap-6">
            <Link href="/chinh-sach" className="hover:text-gray-600 transition-colors">Chính sách bảo mật</Link>
            <Link href="/dieu-khoan" className="hover:text-gray-600 transition-colors">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
