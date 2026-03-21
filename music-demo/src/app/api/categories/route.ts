import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 获取分类列表
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "分类名称不能为空" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("创建分类失败:", error);
    const errorMessage =
      error instanceof Error ? error.message : "创建分类失败";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}