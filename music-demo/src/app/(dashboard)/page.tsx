import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  // 获取统计数据
  const [songCount, categoryCount, instrumentCount] = await Promise.all([
    prisma.song.count(),
    prisma.category.count(),
    prisma.instrument.count(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          欢迎回来，{session?.user?.name || "管理员"}
        </h1>
        <p className="text-gray-600 mt-1">管理您的赞美诗歌和乐谱</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">歌曲总数</p>
              <p className="text-2xl font-semibold text-gray-900">{songCount}</p>
            </div>
          </div>
          <Link
            href="/songs"
            className="mt-4 block text-sm text-blue-600 hover:text-blue-800"
          >
            查看歌曲 →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">分类数量</p>
              <p className="text-2xl font-semibold text-gray-900">
                {categoryCount}
              </p>
            </div>
          </div>
          <Link
            href="/categories"
            className="mt-4 block text-sm text-green-600 hover:text-green-800"
          >
            管理分类 →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">乐器类型</p>
              <p className="text-2xl font-semibold text-gray-900">
                {instrumentCount}
              </p>
            </div>
          </div>
          <Link
            href="/instruments"
            className="mt-4 block text-sm text-purple-600 hover:text-purple-800"
          >
            管理乐器 →
          </Link>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="flex space-x-4">
          <Link
            href="/songs/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加歌曲
          </Link>
          <Link
            href="/categories"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            管理分类
          </Link>
        </div>
      </div>
    </div>
  );
}