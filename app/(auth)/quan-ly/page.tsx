import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatArea, timeAgo } from "@/lib/utils";
import { ListingStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Quản lý tin đăng" };

const STATUS_LABEL: Record<ListingStatus, string> = {
  DRAFT:    "Bản nháp",
  PENDING:  "Chờ duyệt",
  ACTIVE:   "Đang hiển thị",
  SOLD:     "Đã bán/thuê",
  EXPIRED:  "Hết hạn",
  REJECTED: "Bị từ chối",
};

const STATUS_VARIANT: Record<ListingStatus, "default" | "blue" | "green" | "red" | "yellow" | "gray"> = {
  DRAFT:    "gray",
  PENDING:  "yellow",
  ACTIVE:   "green",
  SOLD:     "blue",
  EXPIRED:  "gray",
  REJECTED: "red",
};

async function getUserListings() {
  // TODO: thay bằng session user id
  const user = await db.user.findFirst({ where: { role: "AGENT" } });
  if (!user) return [];

  return db.listing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { leads: true } },
    },
  });
}

export default async function QuanLyPage() {
  const listings = await getUserListings();

  const stats = {
    total:   listings.length,
    active:  listings.filter((l) => l.status === "ACTIVE").length,
    pending: listings.filter((l) => l.status === "PENDING").length,
    leads:   listings.reduce((sum, l) => sum + l._count.leads, 0),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tin đăng của tôi</h1>
        <Link
          href="/dang-tin"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Đăng tin mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Tổng tin",      value: stats.total,   color: "text-gray-900" },
          { label: "Đang hiển thị", value: stats.active,  color: "text-green-700" },
          { label: "Chờ duyệt",     value: stats.pending, color: "text-yellow-700" },
          { label: "Lượt liên hệ",  value: stats.leads,   color: "text-blue-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Listing table */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Bạn chưa có tin đăng nào.</p>
          <Link href="/dang-tin" className="text-blue-600 hover:underline text-sm font-medium">
            Đăng tin đầu tiên →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {listings.map((listing) => {
              const cover = listing.images[0];
              return (
                <div key={listing.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {cover ? (
                      <Image src={cover.url} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/bat-dong-san/${listing.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      <Badge variant={STATUS_VARIANT[listing.status]}>
                        {STATUS_LABEL[listing.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="font-medium text-blue-600">{formatPrice(listing.price)}</span>
                      <span>{formatArea(listing.area)}</span>
                      <span>{listing.district}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                      <span>{timeAgo(listing.createdAt)}</span>
                      <span>{listing.views.toLocaleString("vi-VN")} lượt xem</span>
                      <span className={listing._count.leads > 0 ? "text-blue-600 font-medium" : ""}>
                        {listing._count.leads} liên hệ
                      </span>
                      {listing.expiresAt && (
                        <span>
                          Hết hạn: {new Date(listing.expiresAt).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/quan-ly/chinh-sua/${listing.id}`}
                      className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Sửa
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
