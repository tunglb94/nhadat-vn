import type { Metadata } from "next";
import Link from "next/link";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata: Metadata = {
  title: "Đăng tin bất động sản",
  description: "Đăng tin bất động sản miễn phí trên NhaDat.vn. AI tự động viết mô tả chuyên nghiệp.",
};

const BENEFITS = [
  { icon: "🎯", title: "Tiếp cận hàng ngàn người mua", desc: "Tin đăng của bạn được phân phối đến đúng khách hàng tiềm năng." },
  { icon: "✨", title: "AI viết mô tả chuyên nghiệp", desc: "Tự động tối ưu nội dung, chuẩn SEO, tăng tỷ lệ liên hệ." },
  { icon: "✅", title: "Hoàn toàn miễn phí", desc: "Đăng tin không mất phí. Gói nâng cao tuỳ chọn khi cần." },
];

export default function DangTinPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dải màu */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-brand-600 font-medium transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold">Đăng tin</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-2">
            Đăng tin bất động sản
          </h1>
          <p className="text-gray-500 font-medium">
            Hoàn toàn miễn phí · AI viết nội dung · Duyệt trong 24h
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form chính */}
          <div className="lg:col-span-2">
            <ListingForm />
          </div>

          {/* Sidebar lợi ích */}
          <div className="space-y-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{b.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Tips card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-5 text-white">
              <p className="text-sm font-black mb-3">💡 Mẹo đăng tin hiệu quả</p>
              <ul className="space-y-2 text-xs font-medium text-brand-100">
                <li className="flex items-start gap-2">
                  <span className="text-brand-300 shrink-0">→</span>
                  Tiêu đề rõ ràng: loại BĐS, vị trí, diện tích
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-300 shrink-0">→</span>
                  Giá thực tế, không ảo, dễ thương lượng
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-300 shrink-0">→</span>
                  Mô tả đầy đủ: nội thất, pháp lý, tiện ích
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-300 shrink-0">→</span>
                  Ảnh chụp thực tế, ánh sáng tốt, nhiều góc
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
