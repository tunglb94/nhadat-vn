import slugifyLib from "slugify";

// ── Giá ────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const val = price / 1_000_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(1)} tỷ`;
  }
  if (price >= 1_000_000) {
    const val = price / 1_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(0)} triệu`;
  }
  return price.toLocaleString("vi-VN") + " đ";
}

export function formatPricePerM2(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} tr/m²`;
  }
  return `${price.toLocaleString("vi-VN")} đ/m²`;
}

// ── Diện tích ──────────────────────────────────────────────

export function formatArea(area: number): string {
  return `${area % 1 === 0 ? area : area.toFixed(1)} m²`;
}

// ── Slug ──────────────────────────────────────────────────

export function generateSlug(title: string, id?: string): string {
  const base = slugifyLib(title, {
    lower: true,
    strict: true,
    locale: "vi",
  });
  return id ? `${base}-${id.slice(-6)}` : base;
}

// ── Thời gian ─────────────────────────────────────────────

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

// ── Địa chỉ rút gọn ───────────────────────────────────────

export function shortAddress(district: string, province: string): string {
  const p = province.replace("Thành phố ", "TP.");
  return `${district}, ${p}`;
}

// ── PropertyType label ────────────────────────────────────

export const PROPERTY_TYPE_LABEL: Record<string, string> = {
  NHA_PHO:  "Nhà phố",
  CAN_HO:   "Căn hộ",
  BIET_THU: "Biệt thự",
  DAT_NEN:  "Đất nền",
  MAT_BANG: "Mặt bằng",
  PHONG_TRO:"Phòng trọ",
};

export const LISTING_TYPE_LABEL: Record<string, string> = {
  BAN:  "Bán",
  THUE: "Thuê",
};

// ── Tính pricePerM2 ───────────────────────────────────────

export function calcPricePerM2(price: number, area: number): number {
  if (area <= 0) return 0;
  return Math.round(price / area);
}
