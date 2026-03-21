import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 获取乐器列表
export async function GET() {
  try {
    const instruments = await prisma.instrument.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { sheets: true },
        },
      },
    });

    return NextResponse.json(instruments);
  } catch (error) {
    console.error("获取乐器列表失败:", error);
    return NextResponse.json({ error: "获取乐器列表失败" }, { status: 500 });
  }
}

// 创建乐器
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "乐器名称不能为空" }, { status: 400 });
    }

    const instrument = await prisma.instrument.create({
      data: {
        name,
        description,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(instrument, { status: 201 });
  } catch (error: unknown) {
    console.error("创建乐器失败:", error);
    const errorMessage =
      error instanceof Error ? error.message : "创建乐器失败";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}