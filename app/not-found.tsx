import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy trang</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Trang bạn đang tìm có thể đã bị xoá hoặc tin đăng đã hết hạn.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Về trang chủ
        </Link>
        <Link
          href="/tim-kiem"
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Tìm kiếm
        </Link>
      </div>
    </div>
  );
}
