import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

// 初始化数据库（创建管理员和默认乐器）
export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 创建默认乐器
    const defaultInstruments = [
      { name: "钢琴", sortOrder: 1 },
      { name: "吉他", sortOrder: 2 },
      { name: "贝斯", sortOrder: 3 },
      { name: "鼓", sortOrder: 4 },
      { name: "弦乐", sortOrder: 5 },
      { name: "管乐", sortOrder: 6 },
      { name: "键盘", sortOrder: 7 },
      { name: "其他", sortOrder: 99 },
    ];

    for (const inst of defaultInstruments) {
      await prisma.instrument.upsert({
        where: { name: inst.name },
        update: { sortOrder: inst.sortOrder },
        create: inst,
      });
    }

    return NextResponse.json({
      success: true,
      message: "初始化完成",
    });
  } catch (error) {
    console.error("初始化失败:", error);
    return NextResponse.json({ error: "初始化失败" }, { status: 500 });
  }
}

// 创建初始管理员（仅在没有管理员时可用）
export async function GET() {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      return NextResponse.json({
        error: "已存在管理员，无法通过此接口创建",
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
        name: "管理员",
      },
    });

    return NextResponse.json({
      success: true,
      message: "管理员创建成功",
      username: "admin",
      password: "admin123",
      note: "请登录后立即修改密码",
    });
  } catch (error) {
    console.error("创建管理员失败:", error);
    return NextResponse.json({ error: "创建管理员失败" }, { status: 500 });
  }
}