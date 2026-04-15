import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatArea, timeAgo, PROPERTY_TYPE_LABEL } from "@/lib/utils";
import type { ListingCardData } from "@/types/listing";

interface ListingCardProps {
  listing: ListingCardData;
}

export function ListingCard({ listing }: ListingCardProps) {
  const {
    slug, title, type, propertyType, price, area,
    bedrooms, bathrooms, district, province,
    verified, createdAt, coverImage,
  } = listing;

  return (
    <Link
      href={`/bat-dong-san/${slug}`}
      className="group block bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:border-brand-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500"
    >
      {/* ─── Hình ảnh với hiệu ứng Layer ─── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Lớp phủ Gradient để chữ bên trên rõ hơn */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges cao cấp */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={cn(
            "px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md",
            type === "BAN" ? "bg-brand-600/90 text-white" : "bg-emerald-600/90 text-white"
          )}>
            {type === "BAN" ? "Mua bán" : "Cho thuê"}
          </span>
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/90 text-brand-dark backdrop-blur-md shadow-sm">
            {PROPERTY_TYPE_LABEL[propertyType] ?? propertyType}
          </span>
        </div>

        {verified && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-emerald-600 shadow-sm backdrop-blur-md">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-black uppercase">Tin thật</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Nội dung trình bày sang trọng ─── */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-2xl font-black text-brand-600 leading-none">
            {formatPrice(price)}
            {type === "THUE" && <span className="text-xs font-bold text-gray-400 ml-1">/tháng</span>}
          </p>
          <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        <h3 className="text-sm font-bold text-brand-dark line-clamp-2 mb-4 leading-relaxed min-h-[40px] group-hover:text-brand-600 transition-colors">
          {title}
        </h3>

        {/* Thông số kỹ thuật (Dạng Icon tối giản) */}
        <div className="flex items-center gap-4 py-3 border-y border-gray-50 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span className="text-xs font-bold text-gray-600">{formatArea(area)}</span>
          </div>
          {bedrooms && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-bold text-gray-600">{bedrooms} PN</span>
            </div>
          )}
        </div>

        {/* Vị trí & Thời gian */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 overflow-hidden">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-[11px] font-medium truncate">{district}, {province.replace("Thành phố ", "TP.")}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase shrink-0 tracking-widest">{timeAgo(new Date(createdAt))}</span>
        </div>
      </div>
    </Link>
  );
}

// Helper function để quản lý class (nếu bạn chưa có file cn.ts)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}