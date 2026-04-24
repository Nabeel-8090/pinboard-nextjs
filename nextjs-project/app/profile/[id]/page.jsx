"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`/api/pin/user/${id}`);
        const data = await res.json();
        setPins(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setPins([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPins();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-blue-200 to-blue-500 bg-clip-text text-transparent">
              My Collection
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
                <LayoutGrid size={14} />
                {pins.length} {pins.length === 1 ? "Pin" : "Pins"} Saved
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300 shadow-xl"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Feed</span>
          </button>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-slate-500 font-medium tracking-wide">Syncing your gallery...</p>
          </div>
        ) : pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20">
            <p className="text-slate-500 text-lg">No pins found in this collection.</p>
            <Link href="/create" className="mt-4 text-blue-400 hover:underline">Create your first pin</Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {pins.map((pin) => (
              <Link
                href={`/pin/${pin._id}`}
                key={pin._id}
                className="group block break-inside-avoid relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              >
                {/* IMAGE WITH HOVER ZOOM */}
                <div className="relative overflow-hidden aspect-auto">
                  <img
                    src={pin.image?.url}
                    alt={pin.title}
                    className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                     <div className="w-full py-2.5 bg-blue-600/90 backdrop-blur-md text-white rounded-xl text-xs font-bold uppercase tracking-widest text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        View Artwork
                     </div>
                  </div>
                </div>

                {/* BOTTOM INFO BAR */}
                <div className="p-4 bg-slate-900">
                  <h3 className="text-slate-200 font-bold truncate group-hover:text-blue-400 transition-colors">
                    {pin.title || "Untitled Creation"}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Digital Asset</span>
                    <div className="h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}