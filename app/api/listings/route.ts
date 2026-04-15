import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { generateSlug, calcPricePerM2 } from "@/lib/utils";
import { ListingStatus } from "@prisma/client";
import { z } from "zod";

const CreateListingSchema = z.object({
  type:         z.enum(["BAN", "THUE"]),
  propertyType: z.enum(["NHA_PHO", "CAN_HO", "BIET_THU", "DAT_NEN", "MAT_BANG", "PHONG_TRO"]),
  title:        z.string().min(10).max(200),
  description:  z.string().min(20),
  price:        z.number().positive(),
  area:         z.number().positive(),
  bedrooms:     z.number().int().min(0).nullable().optional(),
  bathrooms:    z.number().int().min(0).nullable().optional(),
  floors:       z.number().int().min(0).nullable().optional(),
  direction:    z.string().optional(),
  province:     z.string().min(1),
  district:     z.string().min(1),
  ward:         z.string().optional(),
  street:       z.string().optional(),
  address:      z.string().min(5),
  lat:          z.number().optional(),
  lng:          z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateListingSchema.parse(body);

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const pricePerM2 = calcPricePerM2(data.price, data.area);

    // Tạo slug unique
    const baseSlug = generateSlug(data.title);
    const existingCount = await db.listing.count({ where: { slug: { startsWith: baseSlug } } });
    const slug = existingCount > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

    const listing = await db.listing.create({
      data: {
        ...data,
        userId: session.user.id,
        slug,
        pricePerM2,
        status: ListingStatus.PENDING,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ id: listing.id, slug: listing.slug }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: err.errors }, { status: 400 });
    }
    console.error("POST /api/listings error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const status = searchParams.get("status") as ListingStatus | null;

    const where = status ? { status } : { status: ListingStatus.ACTIVE };

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      }),
      db.listing.count({ where }),
    ]);

    return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
