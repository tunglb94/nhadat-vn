import { NextRequest, NextResponse } from "next/server";
import { searchListings } from "@/lib/search";
import { parseSearchQuery } from "@/lib/ai";
import type { SearchParams } from "@/types/listing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    let params: SearchParams = {
      q:            searchParams.get("q")            ?? undefined,
      type:         (searchParams.get("type") as SearchParams["type"]) ?? undefined,
      propertyType: searchParams.get("propertyType") ?? undefined,
      province:     searchParams.get("province")     ?? undefined,
      district:     searchParams.get("district")     ?? undefined,
      priceMin:     searchParams.get("priceMin")     ? Number(searchParams.get("priceMin"))  : undefined,
      priceMax:     searchParams.get("priceMax")     ? Number(searchParams.get("priceMax"))  : undefined,
      areaMin:      searchParams.get("areaMin")      ? Number(searchParams.get("areaMin"))   : undefined,
      areaMax:      searchParams.get("areaMax")      ? Number(searchParams.get("areaMax"))   : undefined,
      bedrooms:     searchParams.get("bedrooms")     ? Number(searchParams.get("bedrooms"))  : undefined,
      page:         searchParams.get("page")         ? Number(searchParams.get("page"))      : 1,
      sort:         (searchParams.get("sort") as SearchParams["sort"]) ?? "newest",
    };

    // Parse câu tự nhiên nếu có
    if (params.q) {
      const aiParams = await parseSearchQuery(params.q);
      params = { ...params, ...aiParams };
    }

    const result = await searchListings(params);
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/search error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
