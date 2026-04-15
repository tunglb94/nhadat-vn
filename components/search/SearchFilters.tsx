"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

const PROPERTY_TYPES = [
  { value: "", label: "Tất cả" },
  { value: "NHA_PHO",   label: "Nhà phố" },
  { value: "CAN_HO",    label: "Căn hộ" },
  { value: "BIET_THU",  label: "Biệt thự" },
  { value: "DAT_NEN",   label: "Đất nền" },
  { value: "MAT_BANG",  label: "Mặt bằng" },
  { value: "PHONG_TRO", label: "Phòng trọ" },
];

const PRICE_RANGES_BAN = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-1000000000",           label: "Dưới 1 tỷ" },
  { value: "1000000000-3000000000",  label: "1 – 3 tỷ" },
  { value: "3000000000-5000000000",  label: "3 – 5 tỷ" },
  { value: "5000000000-10000000000", label: "5 – 10 tỷ" },
  { value: "10000000000-",           label: "Trên 10 tỷ" },
];

const PRICE_RANGES_THUE = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-5000000",      label: "Dưới 5 triệu" },
  { value: "5000000-10000000",  label: "5 – 10 triệu" },
  { value: "10000000-20000000", label: "10 – 20 triệu" },
  { value: "20000000-50000000", label: "20 – 50 triệu" },
  { value: "50000000-",         label: "Trên 50 triệu" },
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
  const [priceOpen, setPriceOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const type = searchParams.get("type") ?? "";
  const propertyType = searchParams.get("propertyType") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const priceMin = searchParams.get("priceMin") ?? "";
  const priceMax = searchParams.get("priceMax") ?? "";
  const priceRange = priceMin || priceMax ? `${priceMin}-${priceMax}` : "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/tim-kiem?${params.toString()}`));
  }

  function updatePriceRange(range: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("priceMin"); params.delete("priceMax"); params.delete("page");
    if (range) {
      const [min, max] = range.split("-");
      if (min) params.set("priceMin", min);
      if (max) params.set("priceMax", max);
    }
    startTransition(() => router.push(`/tim-kiem?${params.toString()}`));
    setPriceOpen(false);
  }

  const priceRanges = type === "THUE" ? PRICE_RANGES_THUE : PRICE_RANGES_BAN;
  const activePriceLabel = priceRanges.find(p => p.value === priceRange)?.label ?? "Khoảng giá";
  const activeTypeLabel = PROPERTY_TYPES.find(p => p.value === propertyType)?.label ?? "Loại BĐS";

  const activeFilterCount = [
    type, propertyType, priceRange,
  ].filter(Boolean).length;

  return (
    <div className={`transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Mobile: horizontal scroll pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">

        {/* Loại giao dịch - toggle pills */}
        <div className="flex rounded-2xl border border-gray-200 bg-white overflow-hidden shrink-0">
          {[
            { value: "", label: "Tất cả" },
            { value: "BAN", label: "Mua" },
            { value: "THUE", label: "Thuê" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("type", opt.value)}
              className={`px-3.5 py-2 text-sm font-bold transition-colors whitespace-nowrap ${
                type === opt.value
                  ? "bg-brand-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Loại BĐS - dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => { setTypeOpen((v) => !v); setPriceOpen(false); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-2xl border transition-all whitespace-nowrap ${
              propertyType
                ? "bg-brand-50 border-brand-300 text-brand-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {activeTypeLabel}
            <svg className={`w-3.5 h-3.5 transition-transform ${typeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {typeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20">
                {PROPERTY_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { updateParam("propertyType", opt.value); setTypeOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      propertyType === opt.value
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Khoảng giá - dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => { setPriceOpen((v) => !v); setTypeOpen(false); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-2xl border transition-all whitespace-nowrap ${
              priceRange
                ? "bg-brand-50 border-brand-300 text-brand-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {activePriceLabel}
            <svg className={`w-3.5 h-3.5 transition-transform ${priceOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {priceOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPriceOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20">
                {priceRanges.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePriceRange(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      priceRange === opt.value
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reset nếu có filter */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              startTransition(() => router.push("/tim-kiem"));
            }}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors shrink-0 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xoá lọc ({activeFilterCount})
          </button>
        )}

        {/* Sắp xếp - đẩy sang phải */}
        <div className="ml-auto shrink-0">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="px-3.5 py-2 text-sm font-bold border border-gray-200 rounded-2xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
