import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { ContactForm } from "@/components/listing/ContactForm";
import {
  formatPrice, formatArea, formatPricePerM2,
  timeAgo, PROPERTY_TYPE_LABEL, LISTING_TYPE_LABEL,
} from "@/lib/utils";
import { ListingStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getListing(slug: string) {
  const listing = await db.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      user: { select: { id: true, name: true, phone: true, avatar: true } },
    },
  });
  return listing;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Không tìm thấy" };
  return {
    title: listing.title,
    description: listing.description.substring(0, 160),
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing || listing.status !== ListingStatus.ACTIVE) {
    notFound();
  }

  // Tăng lượt xem (không await để không block render)
  db.listing.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  const coverImage = listing.images.find((img) => img.isCover) ?? listing.images[0];
  const otherImages = listing.images.filter((img) => img.id !== coverImage?.id).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <span>/</span>
        <Link href="/tim-kiem" className="hover:text-blue-600">Tìm kiếm</Link>
        <span>/</span>
        <Link
          href={`/tim-kiem?district=${encodeURIComponent(listing.district)}`}
          className="hover:text-blue-600"
        >
          {listing.district}
        </Link>
        <span>/</span>
        <span className="text-gray-800 line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: ảnh + chi tiết */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery ảnh */}
          <div className="space-y-2">
            {/* Ảnh chính */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
              {coverImage ? (
                <Image
                  src={coverImage.url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Ảnh phụ */}
            {otherImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {otherImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Header tin */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="blue">{LISTING_TYPE_LABEL[listing.type]}</Badge>
              <Badge variant="default">{PROPERTY_TYPE_LABEL[listing.propertyType] ?? listing.propertyType}</Badge>
              {listing.verified && <Badge variant="green">✓ Đã xác thực</Badge>}
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-3">{listing.title}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(listing.price)}
                {listing.type === "THUE" && (
                  <span className="text-base font-normal text-gray-500">/tháng</span>
                )}
              </span>
              {listing.pricePerM2 && (
                <span className="text-sm text-gray-500">
                  {formatPricePerM2(listing.pricePerM2)}
                </span>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{listing.address}</span>
            </div>

            {/* Thông số nhanh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              <Spec label="Diện tích" value={formatArea(listing.area)} />
              {listing.bedrooms != null && <Spec label="Phòng ngủ" value={`${listing.bedrooms} phòng`} />}
              {listing.bathrooms != null && <Spec label="Toilet" value={`${listing.bathrooms} phòng`} />}
              {listing.floors != null && <Spec label="Số tầng" value={`${listing.floors} tầng`} />}
              {listing.direction && <Spec label="Hướng nhà" value={listing.direction} />}
            </div>
          </div>

          {/* Mô tả */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-medium text-gray-900 mb-3">Mô tả chi tiết</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Thông tin bổ sung */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-medium text-gray-900 mb-3">Thông tin bổ sung</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <InfoRow label="Mã tin" value={listing.id.slice(-8).toUpperCase()} />
              <InfoRow label="Đăng lúc" value={timeAgo(listing.createdAt)} />
              <InfoRow label="Lượt xem" value={`${listing.views.toLocaleString("vi-VN")}`} />
              {listing.expiresAt && (
                <InfoRow
                  label="Hết hạn"
                  value={listing.expiresAt.toLocaleDateString("vi-VN")}
                />
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: liên hệ */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            {/* Thông tin người đăng */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm shrink-0">
                {listing.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{listing.user.name}</p>
                <p className="text-xs text-gray-500">Người đăng tin</p>
              </div>
            </div>

            {/* Nút liên hệ nhanh */}
            {listing.user.phone && (
              <div className="space-y-2 mb-4">
                <a
                  href={`tel:${listing.user.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {listing.user.phone}
                </a>
                <a
                  href={`https://zalo.me/${listing.user.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  Chat Zalo
                </a>
              </div>
            )}

            {/* Form gửi tin nhắn */}
            <ContactForm listingId={listing.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </>
  );
}
