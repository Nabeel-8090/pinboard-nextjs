"use client"
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation';
import { Heart, Send, Download, ChevronLeft, Bookmark, X } from 'lucide-react';
import Link from 'next/link';
import { ClipLoader } from 'react-spinners';
import Comment from '@/app/components/Comment';
import toast from 'react-hot-toast';

const Pin = () => {
    const [comment, setComment] = useState("");
    const [pin, setPin] = useState({});
    const [morePins, setMorePins] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [boards, setBoards] = useState([]);
    const [showBoardModal, setShowBoardModal] = useState(false);
    const [savingToBoard, setSavingToBoard] = useState(null);

    const { id } = useParams();
    const { data: session } = useSession();

    const fetchPin = useCallback(async () => {
        try {
            const response = await axios.get(`/api/pin/${id}`);
            const fetchedPin = response.data.pin;
            setPin(fetchedPin);

            const pinLiked = fetchedPin.likes?.some(el => session?.user?.id === el.userId);
            setIsLiked(!!pinLiked);
        } catch (error) {
            console.error("Failed to fetch pin", error);
        }
    }, [id, session]);

    const fetchMorePins = async () => {
        try {
            const response = await axios.get(`/api/pin`);
            setMorePins(response.data.pins.filter(p => p.id !== id && p._id !== id));
        } catch (error) {
            console.error("Failed to fetch more pins", error);
        }
    };

    const fetchBoards = async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/board?userId=${session.user.id}`);
            const data = await res.json();
            setBoards(data.boards || []);
        } catch (err) { console.error(err); }
    };

    const handleSaveToBoard = async (boardId) => {
        if (!session) return toast.error("Sign in to save pins");
        try {
            setSavingToBoard(boardId);
            const res = await fetch(`/api/board/${boardId}/pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinId: id }),
            });
            const data = await res.json();
            toast.success(data.message || "Done!");
            setShowBoardModal(false);
        } catch (err) {
            toast.error("Failed to save to board");
        } finally {
            setSavingToBoard(null);
        }
    };

    const handlePostComment = async () => {
        if (!session) {
            return toast.error("Please sign in to comment");
        }
        if (!comment.trim() || submitting) return;

        try {
            setSubmitting(true);
            await axios.patch(`/api/pin/${id}`, { comment });
            setComment("");
            fetchPin();
            toast.success("Comment added!");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikePin = async () => {
        if (!session) {
            return toast.error("Sign in to like pins");
        }

        try {
            const response = await axios.post(`/api/like/${id}`);
            const data = response.data;
            fetchPin();
            setIsLiked(data.liked);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to like pin");
        }
    };

    useEffect(() => {
        fetchPin();
        fetchMorePins();
        fetchBoards();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPin]);

    if (!pin?.image?.url) {
        return (
            <div className='min-h-screen flex justify-center items-center bg-blue-50/30'>
                <ClipLoader color='#2563eb' size={60} />
            </div>
        );
    }

    const pinOwner = pin.user || {};
    const ownerName = pinOwner.username || "Unknown";
    const ownerImage = pinOwner.image || "/avatar.png";
    const ownerId = pinOwner.id;

    return (
        <div className='min-h-screen bg-[#f8fbff] py-8 px-4'>
            <div className='max-w-6xl mx-auto'>
                <Link href="/" className="inline-flex items-center text-blue-600 font-medium mb-6 hover:translate-x-1 transition-transform">
                    <ChevronLeft size={20} /> Back to feed
                </Link>

                <div className='bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 overflow-hidden border border-blue-50 lg:flex'>
                    {/* Left: Image */}
                    <div className='lg:w-1/2 bg-slate-100 flex items-center justify-center p-4 lg:p-8'>
                        <img
                            src={pin.image?.url}
                            alt={pin.title || "Pin Image"}
                            className='rounded-3xl shadow-lg max-h-[750px] w-full object-contain'
                        />
                    </div>

                    {/* Right: Interaction */}
                    <div className='lg:w-1/2 p-8 lg:p-12 flex flex-col h-full'>

                        {/* Action Bar */}
                        <div className='flex flex-wrap justify-between items-center gap-4 mb-8'>
                            <div className='flex items-center gap-4'>
                                <button
                                    onClick={handleLikePin}
                                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${isLiked
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        }`}
                                >
                                    <Heart size={22} fill={isLiked ? "white" : "none"} className={isLiked ? "animate-pulse" : ""} />
                                    <span>{pin?.likes?.length || 0}</span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (!session) { toast.error("Sign in to save pins"); return; }
                                        setShowBoardModal(true);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                                >
                                    <Bookmark size={20} /> Save
                                </button>
                            </div>

                            <a href={pin?.image?.url} target="_blank" rel="noreferrer" download
                                className='flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg'>
                                <Download size={18} /> Download
                            </a>
                        </div>

                        {/* Pin Content */}
                        <div className='mb-6'>
                            <h1 className='text-4xl font-black text-blue-950 mb-3 tracking-tight'>{pin.title}</h1>
                            <p className='text-slate-600 leading-relaxed'>{pin.description}</p>
                        </div>

                        {/* Pin Owner */}
                        <div className='mb-6 pb-6 border-b border-blue-50'>
                            <p className='text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2'>Created by</p>
                            <Link
                                href={ownerId ? `/profile/${ownerId}` : "#"}
                                className='inline-flex items-center gap-3 group'
                            >
                                <img
                                    src={ownerImage}
                                    alt={ownerName}
                                    className='w-10 h-10 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-400 transition-colors shadow-sm'
                                />
                                <div>
                                    <p className='font-bold text-blue-900 group-hover:text-blue-600 transition-colors'>
                                        {ownerName}
                                    </p>
                                    <p className='text-xs text-slate-400'>View profile</p>
                                </div>
                            </Link>
                        </div>

                        {/* Tags */}
                        {pin.tags?.length > 0 && (
                            <div className='mb-6 flex flex-wrap gap-2'>
                                {pin.tags.map((tag) => (
                                    <span key={tag} className='px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold'>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className='flex-grow flex flex-col min-h-[250px]'>
                            <h3 className='text-xl font-bold text-blue-900 mb-4 flex items-center gap-2'>
                                Comments
                                <span className='bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-sm'>
                                    {pin?.comments?.length || 0}
                                </span>
                            </h3>

                            <div className='flex-grow max-h-[350px] overflow-y-auto space-y-4 pr-2'>
                                {pin?.comments?.length > 0 ? (
                                    pin.comments.map(element => (
                                        <Comment
                                            key={element.id}
                                            user={element.user?.username || element.user?.name || "Unknown User"}
                                            comment={element.comment}
                                            profileImage={element.user?.image || "/avatar.png"}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-blue-50/50 rounded-3xl border border-dashed border-blue-200">
                                        <p className='font-medium text-blue-400 italic'>No comments yet. Start the conversation!</p>
                                    </div>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className='mt-6 pt-6 border-t border-blue-50'>
                                <div className='relative'>
                                    <input
                                        type="text"
                                        placeholder='Add a comment...'
                                        className='w-full bg-blue-50/50 p-4 rounded-2xl pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-200 transition-all text-slate-700'
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    />
                                    <button
                                        disabled={submitting || !comment.trim()}
                                        onClick={handlePostComment}
                                        className='absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300'
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* More to explore */}
                {morePins.length > 0 && (
                    <div className='mt-16'>
                        <h3 className='text-2xl font-black text-blue-950 mb-8'>More to explore</h3>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                            {morePins.map(element => (
                                <Link
                                    href={`/pin/${element.id || element._id}`}
                                    key={element.id || element._id}
                                    className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-200 transition-all duration-300"
                                >
                                    <img
                                        src={element?.image?.url}
                                        alt="Pin"
                                        className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Save to Board Modal — inside the root div, after max-w container */}
            {showBoardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
                        <button
                            onClick={() => setShowBoardModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                        <h2 className="text-xl font-black text-blue-950 mb-4">Save to Board</h2>
                        {boards.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-3">No boards yet.</p>
                                <a
                                    href={`/profile/${session?.user?.id}`}
                                    className="text-blue-500 hover:underline text-sm font-medium"
                                >
                                    Create a board first
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {boards.map((board) => (
                                    <button
                                        key={board.id}
                                        onClick={() => handleSaveToBoard(board.id)}
                                        disabled={savingToBoard === board.id}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 border border-blue-50 hover:border-blue-200 transition-all text-left group"
                                    >
                                        {board.coverImage ? (
                                            <img src={board.coverImage} alt={board.name} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Bookmark size={18} className="text-blue-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-blue-950 truncate group-hover:text-blue-600 transition-colors">{board.name}</p>
                                            <p className="text-xs text-slate-400">{board.pinCount} pins</p>
                                        </div>
                                        {savingToBoard === board.id && (
                                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pin;