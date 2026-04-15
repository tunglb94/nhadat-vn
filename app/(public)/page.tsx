import { Suspense } from "react";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { db } from "@/lib/db";
import { ListingStatus } from "@prisma/client";
import type { ListingCardData } from "@/types/listing";

async function getRecentListings(): Promise<ListingCardData[]> {
  const listings = await db.listing.findMany({
    where: { status: ListingStatus.ACTIVE, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, slug: true, title: true, type: true, propertyType: true,
      price: true, area: true, pricePerM2: true, bedrooms: true, bathrooms: true,
      province: true, district: true, address: true, verified: true, views: true, createdAt: true,
      images: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  });

  return listings.map((l) => ({
    ...l,
    coverImage: l.images[0]?.url ?? null,
  }));
}

const STATS = [
  { value: "12.5K+", label: "Bất động sản xác thực", desc: "Cập nhật mỗi ngày" },
  { value: "98%",    label: "Độ chính xác GPS", desc: "Không lo tin ảo" },
  { value: "100%",   label: "Miễn phí đăng tin", desc: "Dành cho chính chủ" },
  { value: "24/7",   label: "Hỗ trợ khách hàng", desc: "Đội ngũ chuyên nghiệp" },
];

const CATEGORIES = [
  { href: "/tim-kiem?type=BAN&propertyType=NHA_PHO",   title: "Nhà Phố", count: "4,231 tin", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop" },
  { href: "/tim-kiem?type=BAN&propertyType=CAN_HO",    title: "Căn Hộ Cao Cấp", count: "8,102 tin", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop" },
  { href: "/tim-kiem?type=BAN&propertyType=BIET_THU",  title: "Biệt Thự", count: "1,420 tin", image: "https://images.unsplash.com/photo-1613490908653-b7cfbf92afce?q=80&w=800&auto=format&fit=crop" },
  { href: "/tim-kiem?type=BAN&propertyType=DAT_NEN",   title: "Đất Nền Dự Án", count: "3,514 tin", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop" },
];

export default async function HomePage() {
  const recentListings = await getRecentListings();

  return (
    <div className="bg-white min-h-screen selection:bg-brand-500 selection:text-white">
      
      {/* ─── 1. PREMIUM HERO SECTION ─── */}
      <section className="relative w-full h-[85vh] min-h-[600px] max-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Background Image Tuyệt đẹp */}
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop" 
            alt="NhaDat.vn Khám phá không gian sống"
            fill
            className="object-cover scale-105 animate-[pulse-slow_10s_ease-in-out_infinite_alternate]"
            priority
          />
        </div>
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-hero-gradient backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center flex flex-col items-center mt-10">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold tracking-widest backdrop-blur-md mb-6 uppercase">
              ✨ Tiên phong công nghệ BĐS
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1] animate-fade-in-up drop-shadow-2xl" style={{ animationDelay: '0.2s' }}>
            Hành trình tìm nhà <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">
              Chưa bao giờ dễ dàng đến thế
            </span>
          </h1>
          
          <p className="text-gray-200 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto animate-fade-in-up drop-shadow-md" style={{ animationDelay: '0.3s' }}>
            Trải nghiệm tìm kiếm bất động sản thông minh với AI. Dữ liệu minh bạch, hình ảnh chân thực, xác thực vị trí 100%.
          </p>
          
          {/* Box Search dính chặt vào Hero, Glassmorphism cực mạnh */}
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Suspense fallback={<div className="h-20 w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[32px] animate-pulse border border-white/20" />}>
              <div className="max-w-3xl mx-auto p-2 bg-white/10 backdrop-blur-2xl rounded-[32px] shadow-glass border border-white/20">
                <SearchBar />
              </div>
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── 2. FLOATING STATS TẠO ĐỘ TRUST ─── */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 -mt-16 sm:-mt-20">
        <div className="bg-white rounded-[32px] shadow-card border border-gray-100 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {STATS.map((s) => (
              <div key={s.label} className="text-center pt-6 md:pt-0 first:pt-0">
                <p className="text-4xl font-black text-brand-600 mb-2">{s.value}</p>
                <p className="text-base font-bold text-brand-dark mb-1">{s.label}</p>
                <p className="text-sm font-medium text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. DANH MỤC THỊ GIÁC (Visual Categories) ─── */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4">Danh mục nổi bật</h2>
            <p className="text-lg text-gray-500 font-medium">Lựa chọn không gian sống phản ánh đẳng cấp và phong cách của bạn. Hàng ngàn lựa chọn đang chờ đón.</p>
          </div>
          <a href="/tim-kiem" className="hidden md:inline-flex items-center gap-2 font-bold text-brand-600 hover:text-brand-800 transition-colors">
            Khám phá tất cả <span className="text-xl">→</span>
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <a key={cat.href} href={cat.href} className="group relative h-[320px] rounded-[32px] overflow-hidden shadow-soft block isolate">
              {/* Image with Ken Burns effect */}
              <Image 
                src={cat.image} alt={cat.title} fill
                className="object-cover absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <p className="text-white/80 text-sm font-bold tracking-wider mb-2 uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {cat.count}
                </p>
                <h3 className="text-2xl font-black text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {cat.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── 4. WHY CHOOSE US (Trải nghiệm người dùng) ─── */}
      <section className="bg-gray-50 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4">Chuẩn mực mới trong giao dịch</h2>
            <p className="text-lg text-gray-500 font-medium">Chúng tôi loại bỏ những rắc rối truyền thống, mang lại trải nghiệm mượt mà từ lúc tìm kiếm đến khi nhận nhà.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Bản đồ nhiệt & Định giá AI", desc: "Không lo mua hớ. AI phân tích lịch sử giá khu vực và xu hướng tương lai.", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
              { title: "Môi giới tinh hoa", desc: "Chỉ làm việc với các chuyên viên đã được xác thực danh tính và có chứng chỉ hành nghề.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              { title: "Pháp lý minh bạch", desc: "Hiển thị rõ tình trạng sổ đỏ, sổ hồng. Tích hợp công cụ check quy hoạch trực tuyến.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:shadow-card transition-all group">
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg>
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. LISTING GRID SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4">Dành riêng cho bạn</h2>
            <p className="text-lg text-gray-500 font-medium">Những bất động sản nổi bật vừa được cập nhật hệ thống hôm nay.</p>
          </div>
          <a href="/tim-kiem" className="inline-flex items-center justify-center px-6 py-3 bg-brand-50 text-brand-600 rounded-2xl font-bold hover:bg-brand-100 hover:text-brand-700 transition-colors">
            Xem tất cả <span className="ml-2">→</span>
          </a>
        </div>
        
        <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-gray-400">Đang tải dữ liệu...</div>}>
          <ListingGrid listings={recentListings} />
        </Suspense>
      </section>

      {/* ─── 6. BIG CTA (Đăng tin & App) ─── */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="bg-brand-dark rounded-[40px] overflow-hidden relative shadow-2xl">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-brand-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 px-8 py-20 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
            <div className="max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-lg bg-brand-500/20 text-brand-300 font-bold text-sm mb-6 uppercase tracking-wider">
                Dành cho người bán
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Chốt giao dịch nhanh hơn <br className="hidden md:block"/>
                với công nghệ AI
              </h2>
              <p className="text-gray-300 text-lg md:text-xl mb-10 font-medium leading-relaxed">
                NhaDat.vn tự động tối ưu tiêu đề, mô tả chuẩn SEO và phân phối tin đăng của bạn đến đúng đối tượng khách hàng có nhu cầu thực.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a
                  href="/dang-tin"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white font-black text-lg rounded-2xl hover:bg-brand-500 transition-colors shadow-fab hover:-translate-y-1 transform duration-200"
                >
                  + Đăng tin miễn phí
                </a>
                <a
                  href="/bang-gia"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md"
                >
                  Xem bảng giá dịch vụ
                </a>
              </div>
            </div>
            
            {/* Illustration / Graphic bên phải */}
            <div className="hidden lg:flex relative w-[400px] h-[400px] items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-[40px] rotate-6 opacity-50 blur-lg animate-pulse-slow"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] w-full h-full p-8 flex flex-col justify-between shadow-2xl">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">📈</div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">+324% View</div>
                </div>
                <div>
                  <div className="w-3/4 h-4 bg-white/20 rounded-full mb-3"></div>
                  <div className="w-1/2 h-4 bg-white/20 rounded-full mb-6"></div>
                  <div className="w-full h-32 bg-gradient-to-t from-white/20 to-transparent rounded-xl border-b-2 border-brand-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}