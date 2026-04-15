import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ListingStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district     = searchParams.get("district");
    const propertyType = searchParams.get("propertyType");
    const area         = parseFloat(searchParams.get("area") ?? "0");

    if (!district || !propertyType || area <= 0) {
      return NextResponse.json({ error: "Thiếu tham số" }, { status: 400 });
    }

    // Lấy các tin đăng tương tự trong khu vực
    const listings = await db.listing.findMany({
      where: {
        district:     { contains: district, mode: "insensitive" },
        propertyType: propertyType as any,
        type:         "BAN",
        status:       ListingStatus.ACTIVE,
        pricePerM2:   { not: null, gt: 0 },
      },
      select: { price: true, area: true, pricePerM2: true },
      take: 100,
    });

    if (listings.length < 3) {
      return NextResponse.json(
        { error: "Không đủ dữ liệu" },
        { status: 404 }
      );
    }

    const prices = listings.map((l) => l.pricePerM2!).filter((p) => p > 0);

    // Loại bỏ outliers (top/bottom 10%)
    prices.sort((a, b) => a - b);
    const trim  = Math.floor(prices.length * 0.1);
    const clean = prices.slice(trim, prices.length - trim);

    const avgPricePerM2 = clean.reduce((a, b) => a + b, 0) / clean.length;
    const estimatedPrice = Math.round(avgPricePerM2 * area);

    // Khoảng giá: ±20%
    const priceMin = Math.round(estimatedPrice * 0.8);
    const priceMax = Math.round(estimatedPrice * 1.2);

    return NextResponse.json({
      estimatedPrice,
      pricePerM2:  Math.round(avgPricePerM2),
      priceMin,
      priceMax,
      sampleCount: listings.length,
      district,
    });
  } catch (err) {
    console.error("GET /api/estimate error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
