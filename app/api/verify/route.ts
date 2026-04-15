import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const VerifySchema = z.object({
  listingId: z.string().min(1),
  lat:       z.number().optional(),
  lng:       z.number().optional(),
});

// Kiểm tra giá có bất thường không (thấp hơn 30% so với trung bình khu vực)
async function checkPriceAnomaly(
  district: string,
  propertyType: string,
  pricePerM2: number
): Promise<boolean> {
  const similar = await db.listing.findMany({
    where: {
      district,
      propertyType: propertyType as any,
      status: "ACTIVE",
      pricePerM2: { not: null },
    },
    select: { pricePerM2: true },
    take: 50,
  });

  if (similar.length < 5) return false; // Không đủ dữ liệu so sánh

  const prices = similar.map((l) => l.pricePerM2!).filter((p) => p > 0);
  const avg    = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Bất thường nếu thấp hơn 30% trung bình
  return pricePerM2 < avg * 0.7;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, lat, lng } = VerifySchema.parse(body);

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true, lat: true, lng: true,
        district: true, propertyType: true,
        pricePerM2: true, price: true, area: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Tin đăng không tồn tại" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    // Lớp 1: Verify GPS — kiểm tra tọa độ ảnh có khớp địa chỉ không
    if (lat && lng && listing.lat && listing.lng) {
      const distance = calcDistance(lat, lng, listing.lat, listing.lng);
      // Trong vòng 500m là khớp
      if (distance <= 0.5) {
        updates.gpsVerified = true;
      }
    } else if (lat && lng) {
      // Nếu listing chưa có tọa độ, lưu tọa độ mới
      updates.lat = lat;
      updates.lng = lng;
      updates.gpsVerified = true;
    }

    // Lớp 2: Kiểm tra giá bất thường
    if (listing.pricePerM2) {
      const isAnomaly = await checkPriceAnomaly(
        listing.district,
        listing.propertyType,
        listing.pricePerM2
      );
      updates.priceFlag = isAnomaly;
    }

    // Cập nhật verified nếu qua được cả 2 lớp tự động
    if (updates.gpsVerified && !updates.priceFlag) {
      updates.verified = true;
      updates.verifiedAt = new Date();
    }

    await db.listing.update({ where: { id: listingId }, data: updates });

    return NextResponse.json({
      gpsVerified: updates.gpsVerified ?? false,
      priceFlag:   updates.priceFlag   ?? false,
      verified:    updates.verified    ?? false,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("POST /api/verify error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// Haversine formula: tính khoảng cách km giữa 2 tọa độ
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6371;
  const dL = toRad(lat2 - lat1);
  const dG = toRad(lng2 - lng1);
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
