"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type LocalImage } from "./ImageUploader";

type Step = 1 | 2 | 3 | 4;

const PROPERTY_TYPES = [
  { value: "NHA_PHO",   label: "Nhà phố",   icon: "🏠" },
  { value: "CAN_HO",    label: "Căn hộ",    icon: "🏢" },
  { value: "BIET_THU",  label: "Biệt thự",  icon: "🏡" },
  { value: "DAT_NEN",   label: "Đất nền",   icon: "🏗️" },
  { value: "MAT_BANG",  label: "Mặt bằng",  icon: "🏪" },
  { value: "PHONG_TRO", label: "Phòng trọ", icon: "🛏️" },
];

const DIRECTION_OPTIONS = [
  "Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Đông Bắc", "Tây Nam", "Tây Bắc",
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

function formatVND(numStr: string): string {
  const n = parseFloat(numStr.replace(/\./g, "").replace(/,/g, ""));
  if (!n || isNaN(n)) return "";
  const ty = Math.floor(n / 1_000_000_000);
  const trieu = Math.floor((n % 1_000_000_000) / 1_000_000);
  const parts: string[] = [];
  if (ty > 0) parts.push(`${ty} tỷ`);
  if (trieu > 0) parts.push(`${trieu} triệu`);
  return parts.join(" ") || "";
}

export function ListingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateStep(s: Step): boolean {
    const errs: Partial<FormData> = {};
    if (s === 1) {
      if (!form.price.trim()) errs.price = "Nhập giá";
      else if (isNaN(Number(form.price.replace(/\./g, "")))) errs.price = "Giá không hợp lệ";
      if (!form.area.trim()) errs.area = "Nhập diện tích";
      else if (isNaN(Number(form.area))) errs.area = "Diện tích không hợp lệ";
    }
    if (s === 2) {
      if (!form.district.trim()) errs.district = "Nhập quận/huyện";
      if (!form.address.trim()) errs.address = "Nhập địa chỉ đầy đủ";
    }
    if (s === 3) {
      if (!form.title.trim()) errs.title = "Nhập tiêu đề";
      if (form.title.trim().length < 15) errs.title = "Tiêu đề tối thiểu 15 ký tự";
      if (!form.description.trim()) errs.description = "Nhập mô tả";
      if (form.description.trim().length < 30) errs.description = "Mô tả tối thiểu 30 ký tự";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => (s + 1) as Step);
  }

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
      // AI không bắt buộc
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!validateStep(3)) { setStep(3); return; }
    setLoading(true);

    try {
      // 1. Tạo listing
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Đăng tin thất bại");
      }

      const { id: listingId, slug } = await res.json();

      // 2. Upload ảnh nếu có
      if (images.length > 0) {
        setUploadProgress({ done: 0, total: images.length });
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const fd = new FormData();
          fd.append("file", img.file);
          fd.append("listingId", listingId);
          fd.append("isCover", String(img.isCover));
          // Lỗi upload ảnh không block, chỉ log
          try {
            await fetch("/api/upload", { method: "POST", body: fd });
          } catch {
            console.warn(`Upload ảnh ${i + 1} thất bại`);
          }
          setUploadProgress({ done: i + 1, total: images.length });
        }
      }

      router.push(`/bat-dong-san/${slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.";
      setErrors({ title: msg });
      setStep(3);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  const STEPS = [
    { label: "BĐS",     desc: "Thông tin" },
    { label: "Vị trí",  desc: "Địa chỉ" },
    { label: "Nội dung",desc: "Tiêu đề & Mô tả" },
    { label: "Ảnh",     desc: "Hình ảnh" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Progress Steps */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const sNum = (i + 1) as Step;
            const isDone = step > sNum;
            const isActive = step === sNum;
            return (
              <div key={sNum} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                    isDone ? "bg-emerald-500 text-white" :
                    isActive ? "bg-brand-600 text-white shadow-lg shadow-brand-500/40" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {isDone ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : sNum}
                  </div>
                  <p className={`text-[11px] font-bold leading-none ${isActive ? "text-brand-600" : isDone ? "text-emerald-600" : "text-gray-400"}`}>
                    {s.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${isDone ? "bg-emerald-400" : "bg-gray-100"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-50" />

      <div className="p-6">
        {/* ─── Step 1: Thông tin BĐS ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Loại giao dịch</label>
              <div className="flex rounded-2xl border border-gray-200 overflow-hidden p-1 bg-gray-50 gap-1">
                {[
                  { value: "BAN", label: "🏷️ Bán" },
                  { value: "THUE", label: "🔑 Cho thuê" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("type", opt.value)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      form.type === opt.value
                        ? "bg-white text-brand-700 shadow-sm border border-gray-100"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Loại bất động sản</label>
              <div className="grid grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => set("propertyType", pt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      form.propertyType === pt.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl">{pt.icon}</span>
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Giá {form.type === "THUE" ? "(VND/tháng)" : "(VND)"}
                </label>
                <input
                  type="number"
                  placeholder={form.type === "THUE" ? "8000000" : "5500000000"}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                    errors.price ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                {form.price && !errors.price && (
                  <p className="text-xs text-brand-600 font-bold mt-1 ml-1">≈ {formatVND(form.price)}</p>
                )}
                {errors.price && <p className="text-xs text-red-500 mt-1 ml-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Diện tích (m²)</label>
                <input
                  type="number"
                  placeholder="68"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                    errors.area ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                {errors.area && <p className="text-xs text-red-500 mt-1 ml-1">{errors.area}</p>}
              </div>
            </div>

            {["NHA_PHO", "CAN_HO", "BIET_THU", "PHONG_TRO"].includes(form.propertyType) && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Thông số</label>
                <div className="grid grid-cols-3 gap-3">
                  <NumberStepper label="Phòng ngủ" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} />
                  <NumberStepper label="Toilet"    value={form.bathrooms} onChange={(v) => set("bathrooms", v)} />
                  <NumberStepper label="Số tầng"   value={form.floors}    onChange={(v) => set("floors", v)} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hướng nhà (tuỳ chọn)</label>
              <div className="flex flex-wrap gap-2">
                {DIRECTION_OPTIONS.map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => set("direction", form.direction === dir ? "" : dir)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      form.direction === dir
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Địa chỉ ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tỉnh / Thành phố" value={form.province} onChange={(v) => set("province", v)} placeholder="Hồ Chí Minh" />
              <FormField label="Quận / Huyện *" value={form.district} onChange={(v) => set("district", v)} placeholder="Quận 7" error={errors.district} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phường / Xã" value={form.ward} onChange={(v) => set("ward", v)} placeholder="Tân Phú" />
              <FormField label="Tên đường" value={form.street} onChange={(v) => set("street", v)} placeholder="Nguyễn Thị Thập" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Địa chỉ đầy đủ *</label>
              <textarea
                rows={2}
                placeholder="123 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-all ${
                  errors.address ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1 ml-1">{errors.address}</p>}
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Địa chỉ chính xác giúp tin của bạn xuất hiện đúng trên bản đồ và dễ tìm kiếm hơn.
              </p>
            </div>
          </div>
        )}

        {/* ─── Step 3: Tiêu đề + Mô tả ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">✨</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">AI viết nội dung</p>
                  <p className="text-xs text-gray-500">Tự động tạo tiêu đề & mô tả chuyên nghiệp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={aiLoading || !form.district}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-purple-700 text-xs font-bold rounded-xl border border-purple-200 hover:bg-purple-50 disabled:opacity-50 transition-all shadow-sm"
              >
                {aiLoading ? (
                  <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang viết...</>
                ) : "Tạo ngay"}
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-gray-700">Tiêu đề *</label>
                <span className={`text-xs font-medium ${form.title.length < 15 ? "text-gray-400" : form.title.length > 100 ? "text-red-500" : "text-emerald-600"}`}>
                  {form.title.length}/100
                </span>
              </div>
              <input
                type="text"
                placeholder="VD: Bán nhà mặt tiền Quận 7 - 5x20m, 4 tầng, sổ hồng riêng"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={100}
                className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-gray-700">Mô tả chi tiết *</label>
                <span className={`text-xs font-medium ${form.description.length < 30 ? "text-gray-400" : "text-emerald-600"}`}>
                  {form.description.length} ký tự
                </span>
              </div>
              <textarea
                rows={8}
                placeholder="Mô tả chi tiết BĐS: vị trí, nội thất, tiện ích, pháp lý..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-all leading-relaxed ${
                  errors.description ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1 ml-1">{errors.description}</p>}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tóm tắt tin đăng</p>
              <div className="flex flex-wrap gap-2">
                <SummaryBadge label={form.type === "BAN" ? "Bán" : "Cho thuê"} />
                <SummaryBadge label={PROPERTY_TYPES.find(p => p.value === form.propertyType)?.label ?? ""} />
                {form.area && <SummaryBadge label={`${form.area} m²`} />}
                {form.price && <SummaryBadge label={formatVND(form.price)} highlight />}
                {form.district && <SummaryBadge label={form.district} />}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 4: Hình ảnh ─── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Hình ảnh bất động sản</p>
              <p className="text-xs text-gray-500 mb-4">
                Ảnh chất lượng cao giúp tin đăng nổi bật và thu hút người mua.
                Ảnh đầu tiên sẽ là ảnh bìa. Tối đa 10 ảnh.
              </p>
              <ImageUploader images={images} onChange={setImages} maxImages={10} />
            </div>

            {images.length === 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Tin đăng không có ảnh sẽ ít được xem hơn 3 lần. Bạn vẫn có thể bỏ qua và thêm ảnh sau khi đăng.
                </p>
              </div>
            )}

            {/* Upload progress overlay */}
            {uploadProgress && (
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-brand-700">Đang tải ảnh lên...</p>
                  <p className="text-xs text-brand-600 font-bold">{uploadProgress.done}/{uploadProgress.total}</p>
                </div>
                <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-all shadow-soft active:scale-95"
            >
              Tiếp theo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 text-sm font-black text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-all shadow-soft active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploadProgress ? `Đang tải ảnh ${uploadProgress.done}/${uploadProgress.total}...` : "Đang đăng..."}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {images.length > 0 ? `Đăng tin & tải ${images.length} ảnh` : "Đăng tin ngay"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function NumberStepper({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const num = parseInt(value) || 0;
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
      <p className="text-[11px] font-bold text-gray-500 text-center">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(String(Math.max(0, num - 1)))}
          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-90 transition-all font-bold text-sm">
          −
        </button>
        <span className="w-5 text-center text-sm font-black text-gray-900">{num}</span>
        <button type="button" onClick={() => onChange(String(num + 1))}
          className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 active:scale-90 transition-all font-bold text-sm">
          +
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <input
        type="text" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

function SummaryBadge({ label, highlight }: { label: string; highlight?: boolean }) {
  if (!label) return null;
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
      highlight ? "bg-brand-100 text-brand-700 border border-brand-200" : "bg-white text-gray-600 border border-gray-200"
    }`}>
      {label}
    </span>
  );
}
