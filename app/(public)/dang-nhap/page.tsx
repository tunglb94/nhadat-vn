"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-brand-400">NhaDat</span>
              <span className="text-white">.vn</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Nền tảng bất động sản minh bạch</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-hero overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${
                tab === "login"
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${
                tab === "register"
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <div className="p-8">
            {tab === "login" ? (
              <LoginForm callbackUrl={callbackUrl} onSwitchToRegister={() => setTab("register")} />
            ) : (
              <RegisterForm callbackUrl={callbackUrl} onSwitchToLogin={() => setTab("login")} />
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <Link href="/dieu-khoan" className="text-slate-300 hover:text-white">Điều khoản</Link>
          {" "}và{" "}
          <Link href="/chinh-sach" className="text-slate-300 hover:text-white">Chính sách bảo mật</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Login Form ─────────────────────────────────────────────────

function LoginForm({
  callbackUrl,
  onSwitchToRegister,
}: {
  callbackUrl: string;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email hoặc mật khẩu không đúng");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Google */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all font-semibold text-gray-700 text-sm"
      >
        <GoogleIcon />
        Tiếp tục với Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">hoặc đăng nhập bằng email</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 focus:bg-white transition-colors placeholder:text-gray-300"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
            <button type="button" className="text-xs text-brand-600 hover:underline font-medium">
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 focus:bg-white transition-colors placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-brand-600/25"
        >
          {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <button onClick={onSwitchToRegister} className="text-brand-600 font-bold hover:underline">
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}

// ─── Register Form ───────────────────────────────────────────────

function RegisterForm({
  callbackUrl,
  onSwitchToLogin,
}: {
  callbackUrl: string;
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function set(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    startTransition(async () => {
      // Đăng ký
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error ?? "Đăng ký thất bại");
        return;
      }

      // Tự động đăng nhập sau khi đăng ký
      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (loginRes?.error) {
        setError("Đăng ký thành công! Vui lòng đăng nhập.");
        onSwitchToLogin();
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Google */}
      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all font-semibold text-gray-700 text-sm"
      >
        <GoogleIcon />
        Đăng ký bằng Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">hoặc đăng ký bằng email</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Field label="Họ và tên *" type="text" value={form.name} onChange={v => set("name", v)} placeholder="Nguyễn Văn A" autoComplete="name" />
        <Field label="Email *" type="email" value={form.email} onChange={v => set("email", v)} placeholder="you@example.com" autoComplete="email" />
        <Field label="Số điện thoại" type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="0901 234 567" autoComplete="tel" />

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu *</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={e => set("password", e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 focus:bg-white transition-colors placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <Field label="Xác nhận mật khẩu *" type="password" value={form.confirm} onChange={v => set("confirm", v)} placeholder="Nhập lại mật khẩu" autoComplete="new-password" />

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-brand-600/25 mt-2"
        >
          {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <button onClick={onSwitchToLogin} className="text-brand-600 font-bold hover:underline">
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

// ─── Helper components ───────────────────────────────────────────

function Field({
  label, type, value, onChange, placeholder, autoComplete,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 focus:bg-white transition-colors placeholder:text-gray-300"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
    </svg>
  );
}
