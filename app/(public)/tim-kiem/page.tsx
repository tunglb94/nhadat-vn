import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchFilters } from "@/components/search/SearchFilters";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Pagination } from "@/components/search/Pagination";
import { searchListings } from "@/lib/search";
import { parseSearchQuery } from "@/lib/ai";
import type { SearchParams } from "@/types/listing";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q ?? "";
  return {
    title: q ? `"${q}" — Tìm kiếm` : "Tìm kiếm bất động sản",
  };
}

async function SearchResults({ rawParams }: { rawParams: Record<string, string> }) {
  // Parse câu tìm kiếm tự nhiên nếu có
  let params: SearchParams = {
    type:         (rawParams.type as SearchParams["type"]) ?? undefined,
    propertyType: rawParams.propertyType ?? undefined,
    province:     rawParams.province ?? undefined,
    district:     rawParams.district ?? undefined,
    priceMin:     rawParams.priceMin ? Number(rawParams.priceMin) : undefined,
    priceMax:     rawParams.priceMax ? Number(rawParams.priceMax) : undefined,
    areaMin:      rawParams.areaMin  ? Number(rawParams.areaMin)  : undefined,
    areaMax:      rawParams.areaMax  ? Number(rawParams.areaMax)  : undefined,
    bedrooms:     rawParams.bedrooms ? Number(rawParams.bedrooms) : undefined,
    page:         rawParams.page     ? Number(rawParams.page)     : 1,
    sort:         (rawParams.sort as SearchParams["sort"]) ?? "newest",
    q:            rawParams.q ?? undefined,
  };

  // Nếu có câu tự nhiên, parse thêm
  if (rawParams.q) {
    const aiParams = await parseSearchQuery(rawParams.q);
    params = { ...params, ...aiParams };
  }

  const result = await searchListings(params);

  const queryLabel = rawParams.q
    ? `Kết quả cho "${rawParams.q}"`
    : "Tất cả tin đăng";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-medium text-gray-700">
          {queryLabel}
          {result.total > 0 && (
            <span className="ml-2 text-gray-400 font-normal">
              ({result.total.toLocaleString("vi-VN")} tin)
            </span>
          )}
        </h1>
      </div>

      <ListingGrid listings={result.listings} />

      <Suspense>
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          total={result.total}
        />
      </Suspense>
    </div>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Filters */}
      <div className="mb-6">
        <Suspense>
          <SearchFilters />
        </Suspense>
      </div>

      {/* Results */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        }
      >
        <SearchResults rawParams={rawParams} />
      </Suspense>
    </div>
  );
}
