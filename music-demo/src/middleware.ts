import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 仅检查页面路由的认证，API 路由由各自的 handler 自行处理认证
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径
  const publicPaths = ["/login"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 检查 session token（NextAuth v5 使用 authjs 前缀）
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // 未登录 -> 重定向到登录页
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 排除所有 API 路由和静态资源，避免干扰 NextAuth 的 /api/auth/* 请求
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
