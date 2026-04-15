"use client";

import { useState, useRef } from "react";

type JobType = "news" | "promo";

interface Job {
  type: JobType;
  label: string;
  endpoint: string;
  description: string;
  color: string;
  icon: string;
}

const JOBS: Job[] = [
  {
    type: "news",
    label: "Thu thập tin tức BDS",
    endpoint: "/api/seed-news",
    description: "Đọc 9 nguồn RSS lớn (VnExpress, CafeF, Dân Trí…), AI viết lại thành bài báo chuẩn SEO.",
    color: "bg-blue-600 hover:bg-blue-700",
    icon: "📡",
  },
  {
    type: "promo",
    label: "Tạo bài SEO NhaDat.vn",
    endpoint: "/api/seed-promo",
    description: "AI tự sinh 20 bài viết quảng bá NhaDat.vn (hướng dẫn, so sánh, kinh nghiệm…) chuẩn SEO. Bài đã tạo tự động bỏ qua.",
    color: "bg-emerald-600 hover:bg-emerald-700",
    icon: "✍️",
  },
];

export default function ContentSeedPage() {
  const [running, setRunning] = useState<JobType | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeJob, setActiveJob] = useState<JobType | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addLog = (line: string) => {
    setLogs((prev) => [...prev, line]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const startJob = async (job: Job) => {
    if (running) return;

    setLogs([]);
    setRunning(job.type);
    setActiveJob(job.type);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(job.endpoint, { signal: abortRef.current.signal });
      if (!res.ok || !res.body) {
        addLog(`❌ HTTP ${res.status} — kiểm tra lại server.`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Mỗi chunk có thể gồm nhiều dòng
        chunk.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) addLog(trimmed);
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        addLog(`❌ Lỗi kết nối: ${err.message}`);
        addLog("👉 Đảm bảo Ollama đang chạy: ollama serve");
      }
    } finally {
      setRunning(null);
    }
  };

  const stopJob = () => {
    abortRef.current?.abort();
    addLog("⛔ Đã dừng tiến trình.");
    setRunning(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung AI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dùng Ollama + model local để tự động sinh bài viết. Đảm bảo{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">ollama serve</code> đang chạy.
        </p>
      </div>

      {/* Ollama setup reminder */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚙️ Yêu cầu trước khi chạy:</p>
        <ul className="space-y-0.5 list-disc pl-5 font-mono text-xs">
          <li>ollama serve</li>
          <li>ollama pull qwen2.5:7b &nbsp;&nbsp;&nbsp;# nếu chưa có model</li>
        </ul>
      </div>

      {/* Job cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {JOBS.map((job) => (
          <div
            key={job.type}
            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{job.icon}</span>
                <h2 className="font-bold text-gray-900">{job.label}</h2>
                {activeJob === job.type && running === job.type && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-blue-600 font-medium animate-pulse">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping inline-block" />
                    Đang chạy…
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{job.description}</p>
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => startJob(job)}
                disabled={running !== null}
                className={`flex-1 py-2 px-4 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${job.color}`}
              >
                {running === job.type ? "Đang chạy…" : "▶ Chạy ngay"}
              </button>
              {running === job.type && (
                <button
                  onClick={stopJob}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  ⛔ Dừng
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log terminal */}
      {(logs.length > 0 || running) && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">
              {running ? "● Live output" : "○ Kết thúc"}
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Xóa log
            </button>
          </div>
          <div className="bg-gray-950 p-4 h-96 overflow-y-auto font-mono text-xs text-green-400 leading-relaxed">
            {logs.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                {line}
              </div>
            ))}
            {running && (
              <div className="text-gray-500 animate-pulse mt-1">▌</div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm text-gray-600 space-y-3">
        <p className="font-semibold text-gray-800">📖 Hướng dẫn nhanh</p>
        <div className="space-y-1.5">
          <p>
            <span className="font-medium text-gray-700">Thu thập tin tức:</span> Đọc RSS từ 9 báo lớn, lấy 5 bài/nguồn → AI viết lại → lưu DB. Chạy mỗi ngày 1 lần.
          </p>
          <p>
            <span className="font-medium text-gray-700">Bài SEO NhaDat.vn:</span> Tạo 5/20 bài lần đầu. Chạy thêm để tạo hết 20 chủ đề. Bài đã tạo tự động bỏ qua.
          </p>
          <p>
            <span className="font-medium text-gray-700">Đổi số lượng bài promo:</span> Sửa{" "}
            <code className="bg-gray-100 px-1.5 rounded font-mono text-xs">/api/seed-promo?count=10</code>{" "}
            trong <code className="bg-gray-100 px-1.5 rounded font-mono text-xs">JOBS</code> ở đầu file này.
          </p>
          <p>
            <span className="font-medium text-gray-700">Đổi model:</span> Sửa{" "}
            <code className="bg-gray-100 px-1.5 rounded font-mono text-xs">MODEL_NAME</code> trong cả 2 route nếu mày dùng model khác (vd: <code className="bg-gray-100 px-1.5 rounded font-mono text-xs">llama3.2:latest</code>).
          </p>
        </div>
      </div>
    </div>
  );
}
