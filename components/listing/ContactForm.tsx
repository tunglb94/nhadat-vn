"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ContactFormProps {
  listingId: string;
}

export function ContactForm({ listingId }: ContactFormProps) {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Vui lòng điền tên và số điện thoại.");
      return;
    }
    if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, ""))) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/listings/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, ...form }),
      });

      if (!res.ok) throw new Error("Gửi thất bại");
      setSent(true);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">Đã gửi thành công!</p>
        <p className="text-xs text-gray-500 mt-1">Người đăng sẽ liên hệ bạn sớm.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Gửi yêu cầu xem nhà</p>

      <Input
        placeholder="Họ tên của bạn"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Input
        type="tel"
        placeholder="Số điện thoại"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        required
      />
      <textarea
        placeholder="Lời nhắn (tuỳ chọn)..."
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" className="w-full" loading={loading}>
        Gửi yêu cầu
      </Button>
    </form>
  );
}
