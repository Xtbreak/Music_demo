import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintSongPage({ params }: PageProps) {
  const { id } = await params;
  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      category: true,
      sheets: {
        include: {
          instrument: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!song) {
    return <div>歌曲不存在</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* 不打印的顶部操作栏 */}
      <div className="no-print mb-6 flex justify-between items-center">
        <Link href={`/songs/${song.id}`} className="text-blue-600 hover:text-blue-800">
          ← 返回歌曲详情
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          打印
        </button>
      </div>

      {/* 打印内容 */}
      <div className="print-content max-w-4xl mx-auto">
        {/* 歌曲标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{song.title}</h1>
          {song.author && (
            <p className="text-gray-600 mt-2">作者: {song.author}</p>
          )}
          {song.category && (
            <p className="text-gray-500 text-sm mt-1">
              分类: {song.category.name}
            </p>
          )}
        </div>

        {/* 歌词 */}
        {song.lyrics && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">歌词</h2>
            <div className="whitespace-pre-wrap text-lg leading-relaxed">
              {song.lyrics}
            </div>
          </div>
        )}

        {/* 乐谱 */}
        {song.sheets.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold border-b pb-2">乐谱</h2>
            {song.sheets.map((sheet, index) => (
              <div key={sheet.id} className="sheet-section">
                <h3 className="text-lg font-medium mb-2">
                  {index + 1}. {sheet.name || sheet.instrument.name}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {sheet.keySignature && (
                    <span>调性: {sheet.keySignature}</span>
                  )}
                  {sheet.capo && <span>变调夹: {sheet.capo}品</span>}
                  {sheet.tempo && <span>速度: {sheet.tempo} BPM</span>}
                  {sheet.timeSignature && (
                    <span>拍号: {sheet.timeSignature}</span>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                  {sheet.content}
                </div>
                {sheet.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    备注: {sheet.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 页脚 */}
        <div className="mt-12 pt-4 border-t text-center text-sm text-gray-400 no-print">
          赞美诗歌管理系统 · {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
            line-height: 1.6;
          }
          .no-print {
            display: none !important;
          }
          .print-content {
            max-width: 100% !important;
          }
          .sheet-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}