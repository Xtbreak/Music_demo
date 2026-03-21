import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 获取单个乐器
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instrument = await prisma.instrument.findUnique({
      where: { id },
    });

    if (!instrument) {
      return NextResponse.json({ error: "乐器不存在" }, { status: 404 });
    }

    return NextResponse.json(instrument);
  } catch (error) {
    console.error("获取乐器失败:", error);
    return NextResponse.json({ error: "获取乐器失败" }, { status: 500 });
  }
}

// 更新乐器
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, sortOrder } = body;

    const instrument = await prisma.instrument.update({
      where: { id },
      data: {
        name,
        description,
        sortOrder,
      },
    });

    return NextResponse.json(instrument);
  } catch (error: unknown) {
    console.error("更新乐器失败:", error);
    const errorMessage =
      error instanceof Error ? error.message : "更新乐器失败";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// 删除乐器
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 检查是否有乐谱使用该乐器
    const sheetsCount = await prisma.sheet.count({
      where: { instrumentId: id },
    });

    if (sheetsCount > 0) {
      return NextResponse.json(
        { error: "该乐器下还有乐谱，无法删除" },
        { status: 400 }
      );
    }

    await prisma.instrument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除乐器失败:", error);
    return NextResponse.json({ error: "删除乐器失败" }, { status: 500 });
  }
}