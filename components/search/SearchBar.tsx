"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (q: string) => {
    const target = q.trim();
    if (!target) return;
    startTransition(() => {
      router.push(`/tim-kiem?q=${encodeURIComponent(target)}`);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <div className="group relative flex items-center bg-white/90 backdrop-blur-md p-1.5 rounded-[24px] shadow-2xl shadow-brand-500/10 border border-white focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
        <div className="flex-1 flex items-center px-4">
          <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Tìm 'Nhà quận 7 dưới 5 tỷ'..."
            className="w-full px-3 py-3 text-base font-medium bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={() => handleSearch(query)}
          disabled={isPending || !query.trim()}
          className="bg-brand-dark text-white px-6 py-3 rounded-[18px] font-bold text-sm hover:bg-black transition-colors disabled:opacity-50"
        >
          {isPending ? "Đang xử lý..." : "Tìm ngay"}
        </button>
      </div>

      {/* AI Suggestion Tags */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {["Gần Metro", "Sổ hồng riêng", "Hẻm xe tải"].map((tag) => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); handleSearch(tag); }}
            className="px-4 py-1.5 text-xs font-semibold text-brand-dark bg-white/50 border border-white rounded-full hover:bg-brand-50 hover:border-brand-200 transition-all shadow-sm"
          >
            ✨ {tag}
          </button>
        ))}
      </div>
    </div>
  );
}