"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function NewSongPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    lyrics: "",
    author: "",
    description: "",
    tags: "",
    categoryId: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("获取分类失败:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("请输入歌曲标题");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || null,
        }),
      });

      if (res.ok) {
        const song = await res.json();
        router.push(`/songs/${song.id}`);
      } else {
        const data = await res.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("创建歌曲失败:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/songs" className="text-blue-600 hover:text-blue-800">
          ← 返回歌曲列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">添加歌曲</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                歌曲标题 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="输入歌曲标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                作者/作曲
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="作者/作曲者"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                分类
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                标签
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="多个标签用逗号分隔"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              歌词
            </label>
            <textarea
              value={formData.lyrics}
              onChange={(e) =>
                setFormData({ ...formData, lyrics: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={10}
              placeholder="输入歌词内容"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              歌曲描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="歌曲简介、背景等"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/songs"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}