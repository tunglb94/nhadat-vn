"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-5xl font-bold text-gray-200 mb-4">!</p>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Đã có lỗi xảy ra</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        {error.message || "Vui lòng thử lại hoặc quay về trang chủ."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
        <a
          href="/"
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
