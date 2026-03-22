import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    console.log("Testing login for:", username);

    // 1. 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { username },
      select: { id: true, username: true, password: true },
    });

    if (!admin) {
      return NextResponse.json({ step: "findAdmin", error: "用户不存在" });
    }

    console.log("Found admin:", admin.username);

    // 2. 验证密码
    const isValid = await bcrypt.compare(password, admin.password);
    console.log("Password valid:", isValid);

    if (!isValid) {
      return NextResponse.json({ step: "verifyPassword", error: "密码错误" });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Test login error:", error);
    return NextResponse.json({ error: String(error) });
  }
}
