"use client";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function HomeContent() {
  const { data: session } = useSession();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Bikes",
    "Hypercar",
    "Photography",
    "Buildings",
    "Architecture",
    "Food",
    "Adnan shah"
  ];

  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const getPins = async () => {
    setLoading(true);
    try {
      const url = search
        ? `/api/pin?search=${search}`
        : `/api/pin`;

      const response = await axios.get(url);

      setPins(response?.data?.pins || []);
    } catch (error) {
      console.error("Failed to fetch pins", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPins();
  }, [search, session]);

  const filteredPins = activeCategory === "All"
    ? pins
    : pins.filter((pin) => {
      const catLower = activeCategory.toLowerCase();
      return (
        pin.tags?.some((t) => t.toLowerCase().includes(catLower)) ||
        pin.title?.toLowerCase().includes(catLower) ||
        pin.description?.toLowerCase().includes(catLower)
      );
    });

  return (
    <div className="min-h-screen bg-transparent">
      {search && (
        <div className="container mx-auto px-4 pt-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Results for &quot;{search}&quot;
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {pins.length} pins found
          </p>
        </div>
      )}
      {/* Category Filter Strip */}
      {!loading && categories.length > 0 && (
        <div className="sticky top-16 z-40 bg-[#f0f7ff]/95 backdrop-blur-md border-b border-blue-100 py-3">
          <div className="container mx-auto px-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 transform scale-105"
                    : "bg-white text-blue-900 hover:bg-blue-50 border border-blue-100 hover:border-blue-200"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[70vh]">
            <ClipLoader color="#3b82f6" size={60} />
          </div>
        ) : filteredPins.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
            {filteredPins.map((item) => (
              <Link
                href={`/pin/${item._id}`}
                key={item._id}
                className="break-inside-avoid block mb-3 group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <img
                  src={item?.image?.url}
                  alt={item.title || "Pin"}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {item.title && (
                    <p className="text-white font-semibold text-sm truncate drop-shadow-lg">
                      {item.title}
                    </p>
                  )}
                  {item.user && (
                    <p className="text-gray-200 text-xs truncate drop-shadow-lg">
                      by {item.user?.username || "Unknown"}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
            <p className="text-5xl">🔍</p>
            <h3 className="text-2xl font-semibold text-gray-600">
              No results found
            </h3>
            <p className="text-gray-400 text-sm">
              Try searching for something else
            </p>
            <Link
              href="/"
              className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[70vh]"><ClipLoader color="#3b82f6" size={60} /></div>}>
      <HomeContent />
    </Suspense>
  );
}