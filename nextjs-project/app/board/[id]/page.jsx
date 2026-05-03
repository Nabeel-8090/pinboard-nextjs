"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`/api/board/${id}`);
        const data = await res.json();
        setBoard(data.board || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBoard();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this board? The pins won't be deleted.")) return;
    try {
      await fetch(`/api/board/${id}`, { method: "DELETE" });
      router.push(`/profile/${session?.user?.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f0f7ff]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f0f7ff] gap-4">
        <p className="text-2xl font-bold text-blue-950">Board not found</p>
        <Link href="/" className="text-blue-500 hover:underline">Go Home</Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === board.owner?.id;

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium mb-3 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-4xl font-black text-blue-950 tracking-tight">{board.name}</h1>
            {board.description && (
              <p className="text-slate-500 mt-1 text-sm">{board.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Link
                href={`/profile/${board.owner?.id}`}
                className="flex items-center gap-2 group"
              >
                <img
                  src={board.owner?.image || "/avatar.png"}
                  alt={board.owner?.username}
                  className="w-7 h-7 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-400 transition-colors"
                />
                <span className="text-sm text-slate-600 group-hover:text-blue-600 font-medium transition-colors">
                  {board.owner?.username}
                </span>
              </Link>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-xs font-semibold">
                <LayoutGrid size={12} />
                {board.pinCount} {board.pinCount === 1 ? "Pin" : "Pins"}
              </span>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 font-semibold rounded-xl text-sm border border-red-100 transition-all"
            >
              Delete Board
            </button>
          )}
        </div>

        {/* Pin Grid */}
        {board.pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-blue-200 bg-white">
            <p className="text-slate-400 text-lg">This board is empty.</p>
            {isOwner && (
              <Link href="/" className="mt-4 text-blue-500 hover:underline text-sm font-medium">
                Browse pins to save
              </Link>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
            {board.pins.map((pin) => (
              <Link
                href={`/pin/${pin.id}`}
                key={pin.id}
                className="break-inside-avoid block mb-3 group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={pin.image?.url}
                  alt={pin.title || "Pin"}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {pin.title && (
                    <p className="text-white font-semibold text-sm truncate drop-shadow-lg">{pin.title}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
