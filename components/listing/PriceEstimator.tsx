"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatPricePerM2 } from "@/lib/utils";

interface EstimateResult {
  estimatedPrice: number;
  pricePerM2: number;
  priceMin: number;
  priceMax: number;
  sampleCount: number;
  district: string;
}

const PROPERTY_TYPES = [
  { value: "NHA_PHO",   label: "Nhà phố" },
  { value: "CAN_HO",    label: "Căn hộ / Chung cư" },
  { value: "BIET_THU",  label: "Biệt thự" },
  { value: "DAT_NEN",   label: "Đất nền" },
  { value: "MAT_BANG",  label: "Mặt bằng" },
  { value: "PHONG_TRO", label: "Phòng trọ" },
];

export function PriceEstimator() {
  const [form, setForm] = useState({
    district:     "",
    propertyType: "NHA_PHO",
    area:         "",
  });
  const [result,  setResult]  = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleEstimate() {
    if (!form.district.trim() || !form.area) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    const area = parseFloat(form.area);
    if (isNaN(area) || area <= 0) {
      setError("Diện tích không hợp lệ.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/estimate?district=${encodeURIComponent(form.district)}&propertyType=${form.propertyType}&area=${area}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Không đủ dữ liệu để định giá khu vực này. Thử quận/huyện khác.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Quận / Huyện"
          placeholder="VD: Quận 7, Bình Thạnh, Thủ Đức..."
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        />
        <Select
          label="Loại bất động sản"
          options={PROPERTY_TYPES}
          value={form.propertyType}
          onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
        />
        <Input
          label="Diện tích (m²)"
          type="number"
          placeholder="VD: 68"
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleEstimate} loading={loading} className="w-full" size="lg">
        Định giá ngay
      </Button>

      {/* Kết quả */}
      {result && (
        <div className="mt-2 pt-5 border-t border-gray-100 space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Ước tính dựa trên {result.sampleCount} tin đăng tại {result.district}
          </p>

          {/* Giá ước tính */}
          <div className="text-center py-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700 mb-1">Giá ước tính</p>
            <p className="text-3xl font-bold text-blue-700">
              {formatPrice(result.estimatedPrice)}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {formatPricePerM2(result.pricePerM2)}
            </p>
          </div>

          {/* Khoảng giá */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Giá thấp nhất</p>
              <p className="text-sm font-semibold text-gray-700">{formatPrice(result.priceMin)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Giá cao nhất</p>
              <p className="text-sm font-semibold text-gray-700">{formatPrice(result.priceMax)}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            * Chỉ mang tính tham khảo. Giá thực tế có thể chênh lệch tuỳ vị trí, hướng nhà và tình trạng pháp lý.
          </p>
        </div>
      )}
    </div>
  );
}
