import type { Metadata } from "next";
import { PriceEstimator } from "@/components/listing/PriceEstimator";

export const metadata: Metadata = {
  title: "Định giá bất động sản",
  description: "Ước tính giá trị bất động sản dựa trên dữ liệu thị trường thực tế.",
};

export default function DinhGiaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Định giá bất động sản</h1>
        <p className="text-sm text-gray-500">
          Nhập thông tin để ước tính giá trị dựa trên dữ liệu thị trường thực tế trong khu vực.
        </p>
      </div>
      <PriceEstimator />
    </div>
  );
}
