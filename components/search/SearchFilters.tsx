"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const PROPERTY_TYPES = [
  { value: "", label: "Tất cả loại" },
  { value: "NHA_PHO",  label: "Nhà phố" },
  { value: "CAN_HO",   label: "Căn hộ" },
  { value: "BIET_THU", label: "Biệt thự" },
  { value: "DAT_NEN",  label: "Đất nền" },
  { value: "MAT_BANG", label: "Mặt bằng" },
  { value: "PHONG_TRO",label: "Phòng trọ" },
];

const PRICE_RANGES_BAN = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-1000000000",    label: "Dưới 1 tỷ" },
  { value: "1000000000-3000000000",  label: "1 – 3 tỷ" },
  { value: "3000000000-5000000000",  label: "3 – 5 tỷ" },
  { value: "5000000000-10000000000", label: "5 – 10 tỷ" },
  { value: "10000000000-",   label: "Trên 10 tỷ" },
];

const PRICE_RANGES_THUE = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-5000000",    label: "Dưới 5 triệu" },
  { value: "5000000-10000000",  label: "5 – 10 triệu" },
  { value: "10000000-20000000", label: "10 – 20 triệu" },
  { value: "20000000-50000000", label: "20 – 50 triệu" },
  { value: "50000000-",    label: "Trên 50 triệu" },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Mới nhất" },
  { value: "price_asc",  label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "area_asc",   label: "Diện tích tăng" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const type = searchParams.get("type") ?? "";
  const propertyType = searchParams.get("propertyType") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  // Tạo price range string từ params
  const priceMin = searchParams.get("priceMin") ?? "";
  const priceMax = searchParams.get("priceMax") ?? "";
  const priceRange = priceMin || priceMax ? `${priceMin}-${priceMax}` : "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset về trang 1 khi đổi filter
    startTransition(() => {
      router.push(`/tim-kiem?${params.toString()}`);
    });
  }

  function updatePriceRange(range: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("priceMin");
    params.delete("priceMax");
    params.delete("page");
    if (range) {
      const [min, max] = range.split("-");
      if (min) params.set("priceMin", min);
      if (max) params.set("priceMax", max);
    }
    startTransition(() => {
      router.push(`/tim-kiem?${params.toString()}`);
    });
  }

  const priceRanges = type === "THUE" ? PRICE_RANGES_THUE : PRICE_RANGES_BAN;

  return (
    <div className={`flex flex-wrap gap-2 items-center ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Loại giao dịch */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
        {[
          { value: "", label: "Tất cả" },
          { value: "BAN", label: "Mua" },
          { value: "THUE", label: "Thuê" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("type", opt.value)}
            className={`px-3 py-1.5 text-sm transition-colors ${
              type === opt.value
                ? "bg-blue-600 text-white font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loại BĐS */}
      <select
        value={propertyType}
        onChange={(e) => updateParam("propertyType", e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {PROPERTY_TYPES.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Khoảng giá */}
      <select
        value={priceRange}
        onChange={(e) => updatePriceRange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {priceRanges.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Sắp xếp */}
      <select
        value={sort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ml-auto"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
