import { NextRequest, NextResponse } from "next/server";

// Các route cần đăng nhập
const PROTECTED_PATHS = ["/dang-tin", "/quan-ly", "/crm"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Kiểm tra session cookie (NextAuth dùng cookie "authjs.session-token")
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/dang-nhap", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dang-tin/:path*", "/quan-ly/:path*", "/crm/:path*"],
};
