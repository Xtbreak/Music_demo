import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { DefaultSession } from "next-auth";

// 扩展 Session 类型
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
    } & DefaultSession["user"];
  }
}

async function getAdmin(username: string) {
  // 动态导入 Prisma，避免在 edge runtime 中加载
  const { prisma } = await import("./prisma");
  return prisma.admin.findUnique({
    where: { username },
    select: { id: true, username: true, password: true, name: true },
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        console.log("=== 开始登录验证 ===");
        console.log("收到的凭据:", { username: credentials?.username, hasPassword: !!credentials?.password });

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ 缺少用户名或密码");
          return null;
        }

        try {
          const admin = await getAdmin(credentials.username as string);
          console.log("查询管理员结果:", admin ? `找到用户: ${admin.username}` : "用户不存在");

          if (!admin) {
            console.log("❌ 管理员不存在");
            return null;
          }

          console.log("开始验证密码...");
          const isValid = await bcrypt.compare(
            credentials.password as string,
            admin.password
          );
          console.log("密码验证结果:", isValid ? "✓ 正确" : "✗ 错误");

          if (!isValid) {
            console.log("❌ 密码错误");
            return null;
          }

          console.log("✓ 登录成功，返回用户信息");
          return {
            id: admin.id,
            name: admin.name,
            email: null,
            username: admin.username,
          };
        } catch (error) {
          console.error("❌ Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as Record<string, unknown>).username as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});