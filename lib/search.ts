import { db } from "@/lib/db";
import type { SearchParams, SearchResult, ListingCardData } from "@/types/listing";
import { ListingStatus, Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export async function searchListings(params: SearchParams): Promise<SearchResult> {
  const {
    q,
    type,
    propertyType,
    province,
    district,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    bedrooms,
    page = 1,
    sort = "newest",
  } = params;

  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.ACTIVE,
    expiresAt: { gt: new Date() },
  };

  // Lọc theo loại giao dịch
  if (type) where.type = type;

  // Lọc theo loại BĐS
  if (propertyType) where.propertyType = propertyType as any;

  // Lọc địa chỉ
  if (province) where.province = { contains: province, mode: "insensitive" };
  if (district) where.district = { contains: district, mode: "insensitive" };

  // Lọc giá
  if (priceMin || priceMax) {
    where.price = {};
    if (priceMin) where.price.gte = priceMin;
    if (priceMax) where.price.lte = priceMax;
  }

  // Lọc diện tích
  if (areaMin || areaMax) {
    where.area = {};
    if (areaMin) where.area.gte = areaMin;
    if (areaMax) where.area.lte = areaMax;
  }

  // Lọc số phòng ngủ
  if (bedrooms) where.bedrooms = { gte: bedrooms };

  // Tìm kiếm text (Postgres ILIKE - Phase 2 sẽ nâng lên Elasticsearch)
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { title:   { contains: term, mode: "insensitive" } },
      { address: { contains: term, mode: "insensitive" } },
      { district:{ contains: term, mode: "insensitive" } },
      { ward:    { contains: term, mode: "insensitive" } },
      { street:  { contains: term, mode: "insensitive" } },
    ];
  }

  // Sắp xếp — luôn có id làm tiebreaker để pagination ổn định
  // (khi nhiều listing có cùng createdAt, PostgreSQL không đảm bảo thứ tự)
  const orderBy: Prisma.ListingOrderByWithRelationInput[] = (() => {
    switch (sort) {
      case "price_asc":  return [{ price: "asc"  as const }, { id: "asc" as const }];
      case "price_desc": return [{ price: "desc" as const }, { id: "asc" as const }];
      case "area_asc":   return [{ area:  "asc"  as const }, { id: "asc" as const }];
      default:           return [{ createdAt: "desc" as const }, { id: "asc" as const }];
    }
  })();

  const skip = (page - 1) * PAGE_SIZE;

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        propertyType: true,
        price: true,
        area: true,
        pricePerM2: true,
        bedrooms: true,
        bathrooms: true,
        province: true,
        district: true,
        address: true,
        verified: true,
        views: true,
        createdAt: true,
        images: {
          where: { isCover: true },
          take: 1,
          select: { url: true },
        },
      },
    }),
    db.listing.count({ where }),
  ]);

  const result: ListingCardData[] = listings.map((l) => ({
    ...l,
    coverImage: l.images[0]?.url ?? null,
  }));

  return {
    listings: result,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}
