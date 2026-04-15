"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const searchParams = useSearchParams();

  function buildPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/tim-kiem?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <p className="text-sm text-gray-500">
        Trang {currentPage}/{totalPages} · {total.toLocaleString("vi-VN")} tin
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        {currentPage > 1 && (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Trước
          </Link>
        )}

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-3 py-1.5 text-sm text-gray-400">…</span>
          ) : (
            <Link
              key={p}
              href={buildPageUrl(p as number)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                p === currentPage
                  ? "bg-blue-600 text-white border-blue-600 font-medium"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages && (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Tiếp →
          </Link>
        )}
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
