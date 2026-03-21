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
      name,
      content,
      fileUrl,
      keySignature,
      capo,
      tempo,
      timeSignature,
      notes,
      sortOrder,
    } = body;

    if (!songId || (!content && !fileUrl)) {
      return NextResponse.json(
        { error: "请上传乐谱图片或输入乐谱内容" },
        { status: 400 }
      );
    }

    const sheet = await prisma.sheet.create({
      data: {
        songId,
        name,
        content: content || null,
        fileUrl,
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
