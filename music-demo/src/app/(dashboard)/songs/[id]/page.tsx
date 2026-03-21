"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Sheet {
  id: string;
  name: string | null;
  content: string;
  keySignature: string | null;
  capo: number | null;
  tempo: number | null;
  timeSignature: string | null;
  notes: string | null;
  sortOrder: number;
  instrument: {
    id: string;
    name: string;
  };
}

interface Song {
  id: string;
  title: string;
  lyrics: string;
  author: string | null;
  description: string | null;
  tags: string | null;
  viewCount: number;
  createdAt: string;
  category: { id: string; name: string } | null;
  sheets: Sheet[];
}

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [editingSheet, setEditingSheet] = useState<Sheet | null>(null);
  const [instruments, setInstruments] = useState<{ id: string; name: string }[]>([]);

  const [sheetForm, setSheetForm] = useState({
    instrumentId: "",
    name: "",
    content: "",
    keySignature: "",
    capo: 0,
    tempo: 0,
    timeSignature: "",
    notes: "",
    sortOrder: 0,
  });

  const fetchSong = async () => {
    try {
      const res = await fetch(`/api/songs/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSong(data);
      } else {
        alert("歌曲不存在");
        router.push("/songs");
      }
    } catch (error) {
      console.error("获取歌曲详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstruments = async () => {
    try {
      const res = await fetch("/api/instruments");
      const data = await res.json();
      setInstruments(data);
    } catch (error) {
      console.error("获取乐器列表失败:", error);
    }
  };

  useEffect(() => {
    fetchSong();
    fetchInstruments();
  }, [params.id]);

  const openAddSheetForm = () => {
    setEditingSheet(null);
    setSheetForm({
      instrumentId: "",
      name: "",
      content: "",
      keySignature: "",
      capo: 0,
      tempo: 0,
      timeSignature: "",
      notes: "",
      sortOrder: 0,
    });
    setShowSheetForm(true);
  };

  const openEditSheetForm = (sheet: Sheet) => {
    setEditingSheet(sheet);
    setSheetForm({
      instrumentId: sheet.instrument.id,
      name: sheet.name || "",
      content: sheet.content,
      keySignature: sheet.keySignature || "",
      capo: sheet.capo || 0,
      tempo: sheet.tempo || 0,
      timeSignature: sheet.timeSignature || "",
      notes: sheet.notes || "",
      sortOrder: sheet.sortOrder,
    });
    setShowSheetForm(true);
  };

  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSheet
        ? `/api/sheets/${editingSheet.id}`
        : "/api/sheets";
      const method = editingSheet ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sheetForm,
          songId: params.id,
          capo: sheetForm.capo || null,
          tempo: sheetForm.tempo || null,
        }),
      });

      if (res.ok) {
        setShowSheetForm(false);
        fetchSong();
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存乐谱失败:", error);
      alert("保存失败");
    }
  };

  const handleDeleteSheet = async (sheetId: string) => {
    if (!confirm("确定要删除该乐谱吗？")) return;

    try {
      const res = await fetch(`/api/sheets/${sheetId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSong();
      }
    } catch (error) {
      console.error("删除乐谱失败:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">加载中...</div>;
  }

  if (!song) {
    return <div className="text-center py-10">歌曲不存在</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/songs" className="text-blue-600 hover:text-blue-800">
          ← 返回歌曲列表
        </Link>
      </div>

      {/* 歌曲信息 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{song.title}</h1>
            {song.author && (
              <p className="text-gray-600 mt-1">作者: {song.author}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/songs/${song.id}/edit`}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              编辑
            </Link>
            <Link
              href={`/songs/${song.id}/print`}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              打印
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {song.category && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              分类: {song.category.name}
            </span>
          )}
          {song.tags && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              标签: {song.tags}
            </span>
          )}
          <span className="bg-gray-100 px-2 py-1 rounded">
            浏览: {song.viewCount}
          </span>
        </div>

        {song.description && (
          <p className="text-gray-600 mb-4">{song.description}</p>
        )}

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">歌词</h3>
          <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded">
            {song.lyrics || "暂无歌词"}
          </div>
        </div>
      </div>

      {/* 乐谱列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">乐谱 ({song.sheets.length})</h2>
          <button
            onClick={openAddSheetForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加乐谱
          </button>
        </div>

        {song.sheets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无乐谱，请添加</p>
        ) : (
          <div className="space-y-4">
            {song.sheets.map((sheet) => (
              <div
                key={sheet.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {sheet.name || sheet.instrument.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                      <span>乐器: {sheet.instrument.name}</span>
                      {sheet.keySignature && (
                        <span>调性: {sheet.keySignature}</span>
                      )}
                      {sheet.capo && <span>变调夹: {sheet.capo}</span>}
                      {sheet.tempo && <span>速度: {sheet.tempo} BPM</span>}
                      {sheet.timeSignature && (
                        <span>拍号: {sheet.timeSignature}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditSheetForm(sheet)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteSheet(sheet.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
                {sheet.notes && (
                  <p className="text-sm text-gray-500 mt-2">{sheet.notes}</p>
                )}
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm font-mono whitespace-pre-wrap">
                  {sheet.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 乐谱表单弹窗 */}
      {showSheetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingSheet ? "编辑乐谱" : "添加乐谱"}
            </h2>
            <form onSubmit={handleSheetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    乐器 *
                  </label>
                  <select
                    required
                    value={sheetForm.instrumentId}
                    onChange={(e) =>
                      setSheetForm({ ...sheetForm, instrumentId: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">选择乐器</option>
                    {instruments.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    乐谱名称
                  </label>
                  <input
                    type="text"
                    value={sheetForm.name}
                    onChange={(e) =>
                      setSheetForm({ ...sheetForm, name: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="可选，默认使用乐器名"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    调性
                  </label>
                  <input
                    type="text"
                    value={sheetForm.keySignature}
                    onChange={(e) =>
                      setSheetForm({ ...sheetForm, keySignature: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="C, D, G..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    变调夹
                  </label>
                  <input
                    type="number"
                    value={sheetForm.capo}
                    onChange={(e) =>
                      setSheetForm({
                        ...sheetForm,
                        capo: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    速度(BPM)
                  </label>
                  <input
                    type="number"
                    value={sheetForm.tempo}
                    onChange={(e) =>
                      setSheetForm({
                        ...sheetForm,
                        tempo: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    拍号
                  </label>
                  <input
                    type="text"
                    value={sheetForm.timeSignature}
                    onChange={(e) =>
                      setSheetForm({
                        ...sheetForm,
                        timeSignature: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="4/4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  乐谱内容 *
                </label>
                <textarea
                  required
                  value={sheetForm.content}
                  onChange={(e) =>
                    setSheetForm({ ...sheetForm, content: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                  rows={10}
                  placeholder="输入和弦、简谱等乐谱内容"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  备注
                </label>
                <textarea
                  value={sheetForm.notes}
                  onChange={(e) =>
                    setSheetForm({ ...sheetForm, notes: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  排序
                </label>
                <input
                  type="number"
                  value={sheetForm.sortOrder}
                  onChange={(e) =>
                    setSheetForm({
                      ...sheetForm,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSheetForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}