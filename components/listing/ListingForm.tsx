"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Step = 1 | 2 | 3;

const PROPERTY_TYPE_OPTIONS = [
  { value: "NHA_PHO",   label: "Nhà phố" },
  { value: "CAN_HO",    label: "Căn hộ / Chung cư" },
  { value: "BIET_THU",  label: "Biệt thự" },
  { value: "DAT_NEN",   label: "Đất nền" },
  { value: "MAT_BANG",  label: "Mặt bằng / Văn phòng" },
  { value: "PHONG_TRO", label: "Phòng trọ" },
];

const DIRECTION_OPTIONS = [
  { value: "Đông",    label: "Đông" },
  { value: "Tây",     label: "Tây" },
  { value: "Nam",     label: "Nam" },
  { value: "Bắc",     label: "Bắc" },
  { value: "Đông Nam",label: "Đông Nam" },
  { value: "Đông Bắc",label: "Đông Bắc" },
  { value: "Tây Nam", label: "Tây Nam" },
  { value: "Tây Bắc", label: "Tây Bắc" },
];

interface FormData {
  type: string;
  propertyType: string;
  title: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  direction: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  address: string;
  description: string;
}

const EMPTY_FORM: FormData = {
  type: "BAN", propertyType: "NHA_PHO",
  title: "", price: "", area: "",
  bedrooms: "", bathrooms: "", floors: "", direction: "",
  province: "Hồ Chí Minh", district: "", ward: "", street: "", address: "",
  description: "",
};

export function ListingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // Validate từng step
  function validateStep(s: Step): boolean {
    const errs: Partial<FormData> = {};
    if (s === 1) {
      if (!form.propertyType) errs.propertyType = "Chọn loại bất động sản";
      if (!form.price.trim()) errs.price = "Nhập giá";
      else if (isNaN(Number(form.price.replace(/\./g, "")))) errs.price = "Giá không hợp lệ";
      if (!form.area.trim()) errs.area = "Nhập diện tích";
    }
    if (s === 2) {
      if (!form.district.trim()) errs.district = "Nhập quận/huyện";
      if (!form.address.trim()) errs.address = "Nhập địa chỉ đầy đủ";
    }
    if (s === 3) {
      if (!form.title.trim()) errs.title = "Nhập tiêu đề";
      if (!form.description.trim()) errs.description = "Nhập mô tả";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => (s + 1) as Step);
  }

  // Gọi AI để tạo tiêu đề + mô tả
  async function generateWithAI() {
    if (!form.propertyType || !form.area || !form.district) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/listings/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          title: data.title ?? prev.title,
          description: data.description ?? prev.description,
        }));
      }
    } catch {
      // AI không bắt buộc, user tự điền được
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const priceNum = parseFloat(form.price.replace(/\./g, "").replace(",", "."));
      const areaNum = parseFloat(form.area);

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: priceNum,
          area: areaNum,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          floors: form.floors ? parseInt(form.floors) : null,
        }),
      });

      if (!res.ok) throw new Error("Đăng tin thất bại");
      const data = await res.json();
      router.push(`/bat-dong-san/${data.slug}`);
    } catch {
      setErrors({ title: "Có lỗi xảy ra, vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = ["Thông tin BĐS", "Vị trí", "Nội dung"];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-gray-100">
        {stepLabels.map((label, i) => {
          const s = (i + 1) as Step;
          return (
            <div
              key={s}
              className={`flex-1 py-3 text-center text-sm transition-colors ${
                step === s
                  ? "bg-blue-50 text-blue-700 font-medium border-b-2 border-blue-600"
                  : step > s
                  ? "text-gray-400 bg-gray-50"
                  : "text-gray-400"
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 text-xs ${
                step > s ? "bg-green-500 text-white" : step === s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>{step > s ? "✓" : s}</span>
              {label}
            </div>
          );
        })}
      </div>

      <div className="p-6">
        {/* Step 1: Thông tin BĐS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Loại giao dịch */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Loại giao dịch</p>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[
                    { value: "BAN", label: "Bán" },
                    { value: "THUE", label: "Cho thuê" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("type", opt.value)}
                      className={`flex-1 py-2 text-sm transition-colors ${
                        form.type === opt.value
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Loại bất động sản"
                options={PROPERTY_TYPE_OPTIONS}
                value={form.propertyType}
                onChange={(e) => set("propertyType", e.target.value)}
                error={errors.propertyType}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Giá (VND)"
                placeholder="VD: 5000000000"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                error={errors.price}
                hint={form.type === "THUE" ? "Giá mỗi tháng" : ""}
              />
              <Input
                label="Diện tích (m²)"
                type="number"
                placeholder="VD: 68"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                error={errors.area}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Phòng ngủ"
                type="number"
                placeholder="0"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
              />
              <Input
                label="Toilet"
                type="number"
                placeholder="0"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
              />
              <Input
                label="Số tầng"
                type="number"
                placeholder="0"
                value={form.floors}
                onChange={(e) => set("floors", e.target.value)}
              />
            </div>

            <Select
              label="Hướng nhà"
              placeholder="Chọn hướng (tuỳ chọn)"
              options={DIRECTION_OPTIONS}
              value={form.direction}
              onChange={(e) => set("direction", e.target.value)}
            />
          </div>
        )}

        {/* Step 2: Địa chỉ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tỉnh / Thành phố"
                placeholder="Hồ Chí Minh"
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
              />
              <Input
                label="Quận / Huyện"
                placeholder="Quận 7"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                error={errors.district}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phường / Xã"
                placeholder="Tân Phú"
                value={form.ward}
                onChange={(e) => set("ward", e.target.value)}
              />
              <Input
                label="Tên đường"
                placeholder="Nguyễn Thị Thập"
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
              />
            </div>
            <Input
              label="Địa chỉ đầy đủ"
              placeholder="123 Nguyễn Thị Thập, Phường Tân Phú, Quận 7"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              error={errors.address}
              hint="Địa chỉ chính xác giúp tin của bạn được ưu tiên hiển thị"
            />
          </div>
        )}

        {/* Step 3: Tiêu đề + Mô tả */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-700">Nội dung tin đăng</p>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI đang viết...
                  </>
                ) : (
                  <>✨ AI viết giúp tôi</>
                )}
              </button>
            </div>

            <Input
              label="Tiêu đề"
              placeholder="VD: Bán nhà mặt tiền Quận 7 - 5x20m, 4 tầng"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
              <textarea
                rows={8}
                placeholder="Mô tả chi tiết về bất động sản..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? "border-red-300" : "border-gray-300 hover:border-gray-400"
                }`}
              />
              {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep((s) => (s - 1) as Step)}>
              ← Quay lại
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={nextStep}>
              Tiếp theo →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Đăng tin ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
