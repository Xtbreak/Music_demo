import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 创建乐谱
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const {
      songId,
      instrumentId,
      name,
      content,
      keySignature,
      capo,
      tempo,
      timeSignature,
      notes,
      sortOrder,
    } = body;

    if (!songId || !instrumentId || !content) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }

    // 检查是否已存在相同乐器
    const existing = await prisma.sheet.findUnique({
      where: {
        songId_instrumentId: {
          songId,
          instrumentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "该歌曲已有此乐器的乐谱，请编辑现有乐谱" },
        { status: 400 }
      );
    }

    const sheet = await prisma.sheet.create({
      data: {
        songId,
        instrumentId,
        name,
        content,
        keySignature,
        capo,
        tempo,
        timeSignature,
        notes,
        sortOrder: sortOrder || 0,
      },
      include: {
        instrument: true,
      },
    });

    return NextResponse.json(sheet, { status: 201 });
  } catch (error: unknown) {
    console.error("创建乐谱失败:", error);
    const errorMessage =
      error instanceof Error ? error.message : "创建乐谱失败";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}