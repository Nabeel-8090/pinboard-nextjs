"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Loader2, Plus, Bookmark, X } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [pins, setPins] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pins"); // "pins" | "boards"
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: "", description: "" });
  const [creatingBoard, setCreatingBoard] = useState(false);

  const isOwner = session?.user?.id === id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pinsRes, boardsRes] = await Promise.all([
          fetch(`/api/pin/user/${id}`),
          fetch(`/api/board?userId=${id}`),
        ]);
        const pinsData = await pinsRes.json();
        const boardsData = await boardsRes.json();
        setPins(Array.isArray(pinsData.pins) ? pinsData.pins : []);
        setBoards(Array.isArray(boardsData.boards) ? boardsData.boards : []);
      } catch (err) {
        console.error(err);
        setPins([]);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleCreateBoard = async () => {
    if (!boardForm.name.trim()) {
      toast.error("Board name is required");
      return;
    }
    try {
      setCreatingBoard(true);
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boardForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Board created!");
      setBoards((prev) => [
        { ...data.board, pinCount: 0, pins: [] },
        ...prev,
      ]);
      setBoardForm({ name: "", description: "" });
      setShowBoardModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to create board");
    } finally {
      setCreatingBoard(false);
    }
  };

  // Get username from first pin or session
  const profileUsername =
    pins[0]?.user?.username ||
    (isOwner ? session?.user?.name : null) ||
    "User";

  const profileImage =
    pins[0]?.user?.image ||
    (isOwner ? session?.user?.image : null) ||
    "/avatar.png";

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="group inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 hover:border-blue-300 rounded-xl text-slate-600 hover:text-blue-600 transition-all duration-200 shadow-sm mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <img
            src={profileImage}
            alt={profileUsername}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
          />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-black text-blue-950 tracking-tight">
              {profileUsername}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-semibold">
                <LayoutGrid size={13} />
                {pins.length} {pins.length === 1 ? "Pin" : "Pins"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-semibold">
                <Bookmark size={13} />
                {boards.length} {boards.length === 1 ? "Board" : "Boards"}
              </span>
            </div>
          </div>

          {isOwner && (
            <Link
              href="/upload-pin"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              <Plus size={16} /> New Pin
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["pins", "boards"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-semibold text-sm capitalize transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-blue-800 border border-blue-100 hover:bg-blue-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-slate-400 font-medium">Loading...</p>
          </div>
        ) : activeTab === "pins" ? (
          pins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-blue-200 bg-white">
              <p className="text-slate-400 text-lg">No pins yet.</p>
              {isOwner && (
                <Link href="/upload-pin" className="mt-4 text-blue-500 hover:underline text-sm font-medium">
                  Create your first pin
                </Link>
              )}
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
              {pins.map((pin) => (
                <Link
                  href={`/pin/${pin._id}`}
                  key={pin._id}
                  className="group block break-inside-avoid mb-3 relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={pin.image?.url}
                    alt={pin.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm truncate drop-shadow-lg">
                      {pin.title || "Untitled"}
                    </p>
                    <p className="text-slate-200 text-xs">
                      {pin.likes?.length || 0} likes · {pin.comments?.length || 0} comments
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          /* BOARDS TAB */
          <div>
            {isOwner && (
              <button
                onClick={() => setShowBoardModal(true)}
                className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                <Plus size={16} /> Create Board
              </button>
            )}

            {boards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-blue-200 bg-white">
                <Bookmark size={40} className="text-blue-200 mb-3" />
                <p className="text-slate-400 text-lg">No boards yet.</p>
                {isOwner && (
                  <button
                    onClick={() => setShowBoardModal(true)}
                    className="mt-4 text-blue-500 hover:underline text-sm font-medium"
                  >
                    Create your first board
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {boards.map((board) => (
                  <Link
                    href={`/board/${board.id}`}
                    key={board.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-lg hover:shadow-blue-100 transition-all duration-300"
                  >
                    {/* Board Cover */}
                    <div className="relative aspect-video bg-blue-50 overflow-hidden">
                      {board.coverImage ? (
                        <img
                          src={board.coverImage}
                          alt={board.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bookmark size={32} className="text-blue-200" />
                        </div>
                      )}
                    </div>
                    {/* Board Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-blue-950 truncate group-hover:text-blue-600 transition-colors">
                        {board.name}
                      </h3>
                      {board.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{board.description}</p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 font-medium">
                        <LayoutGrid size={11} />
                        {board.pinCount} {board.pinCount === 1 ? "pin" : "pins"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowBoardModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>

            <h2 className="text-2xl font-black text-blue-950 mb-6">New Board</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-1">
                  Board Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Travel Inspo, Architecture..."
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-blue-50/40 border border-blue-100 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-1">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="What's this board about?"
                  value={boardForm.description}
                  onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-blue-50/40 border border-blue-100 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm"
                />
              </div>

              <button
                onClick={handleCreateBoard}
                disabled={creatingBoard}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 disabled:opacity-60"
              >
                {creatingBoard ? "Creating..." : "Create Board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
