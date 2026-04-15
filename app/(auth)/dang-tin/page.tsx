import type { Metadata } from "next";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata: Metadata = {
  title: "Đăng tin bất động sản",
};

export default function DangTinPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Đăng tin bất động sản</h1>
        <p className="text-sm text-gray-500 mt-1">
          Điền thông tin bên dưới. AI sẽ tự động viết mô tả chuyên nghiệp cho bạn.
        </p>
      </div>
      <ListingForm />
    </div>
  );
}
