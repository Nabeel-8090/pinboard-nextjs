"use client"
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation';
import { Heart, Send, Download, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ClipLoader } from 'react-spinners';
import Comment from '@/app/components/Comment';
import { toast, ToastContainer } from 'react-toastify';

const Pin = () => {
    const [comment, setComment] = useState("");
    const [pin, setPin] = useState({});
    const [morePins, setMorePins] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const { id } = useParams();
    const { data: session } = useSession();

    const fetchPin = useCallback(async () => {
        try {
            const response = await axios.get(`/api/pin/${id}`);
            setPin(response.data.pin);
            const pinLiked = response.data.pin.likes?.some(el => session?.user?.name === el.user);
            setIsLiked(!!pinLiked);
        } catch (error) {
            console.error("Failed to fetch pin", error);
        }
    }, [id, session]);

    const fetchMorePins = async () => {
        try {
            const response = await axios.get(`/api/pin`);
            setMorePins(response.data.pins.filter(p => p._id !== id));
        } catch (error) {
            console.error("Failed to fetch more pins", error);
        }
    };

    const handlePostComment = async () => {
        if (!comment.trim() || submitting) return;
        try {
            setSubmitting(true);
            await axios.patch(`/api/pin/${id}`, {
                user: session?.user?.name || "Anonymous",
                profileImage: session?.user?.image || "/avatar.png",
                comment,
            });
            setComment("");
            fetchPin();
            toast.success("Comment added!");
        } catch (error) {
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikePin = async () => {
        try {
            const response = await axios.post(`/api/like/${id}`);
            fetchPin();
            if(!isLiked) toast.info("Pin Liked");
        } catch (error) {
            toast.error("Sign in to like pins");
        }
    };

    useEffect(() => {
        fetchPin();
        fetchMorePins();
    }, [fetchPin]);

    if (!pin?.image?.url) {
        return (
            <div className='min-h-screen flex justify-center items-center bg-blue-50/30'>
                <ClipLoader color='#2563eb' size={60} />
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#f8fbff] py-8 px-4'>
            <ToastContainer position="bottom-right" theme="colored" />
            
            <div className='max-w-6xl mx-auto'>
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center text-blue-600 font-medium mb-6 hover:translate-x-1 transition-transform">
                    <ChevronLeft size={20} /> Back to feed
                </Link>

                <div className='bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 overflow-hidden border border-blue-50 lg:flex'>
                    
                    {/* Left: Image Section */}
                    <div className='lg:w-1/2 bg-slate-100 flex items-center justify-center p-4 lg:p-8'>
                        <img
                            src={pin.image?.url} 
                            alt={pin.title}
                            className='rounded-3xl shadow-lg max-h-[750px] w-full object-contain'
                        />
                    </div>

                    {/* Right: Interaction Section */}
                    <div className='lg:w-1/2 p-8 lg:p-12 flex flex-col h-full'>
                        
                        {/* Action Bar */}
                        <div className='flex justify-between items-center mb-10'>
                            <div className='flex items-center gap-4'>
                                <button 
                                    onClick={handleLikePin}
                                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
                                        isLiked 
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    }`}
                                >
                                    <Heart size={22} fill={isLiked ? "white" : "none"} className={isLiked ? "animate-pulse" : ""} />
                                    <span>{pin?.likes?.length || 0}</span>
                                </button>
                            </div>
                            
                            <a href={pin?.image?.url} target="_blank" download
                                className='flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg'>
                                <Download size={18} /> Download
                            </a>
                        </div>

                        {/* Content */}
                        <div className='mb-8'>
                            <h1 className='text-4xl font-black text-blue-950 mb-4 tracking-tight'>{pin.title}</h1>
                            <p className='text-slate-600 leading-relaxed'>{pin.description}</p>
                        </div>

                        {/* Comments Section */}
                        <div className='flex-grow flex flex-col min-h-[300px]'>
                            <h3 className='text-xl font-bold text-blue-900 mb-6 flex items-center gap-2'>
                                Comments <span className='bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-sm'>{pin?.comments?.length}</span>
                            </h3>
                            
                            <div className='flex-grow max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar'>
                                {pin?.comments?.length > 0 ? (
                                    pin.comments.map(element => (
                                        <Comment 
                                            key={element._id} 
                                            user={element.user}
                                            comment={element.comment}
                                            profileImage={element.profileImage} 
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-blue-50/50 rounded-3xl border border-dashed border-blue-200">
                                        <p className='font-medium text-blue-400 italic'>No comments yet. Start the conversation!</p>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className='mt-8 pt-6 border-t border-blue-50'>
                                <div className='relative group'>
                                    <input 
                                        type="text" 
                                        placeholder='Add a comment...'
                                        className='w-full bg-blue-50/50 p-4 rounded-2xl pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-200 transition-all text-slate-700'
                                        value={comment} 
                                        onChange={(e) => setComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    />
                                    <button 
                                        disabled={submitting}
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

                {/* More to explore Section */}
                <div className='mt-16'>
                    <h3 className='text-2xl font-black text-blue-950 mb-8'>More to explore</h3>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                        {morePins.map(element => (
                            <Link href={`/pin/${element._id}`} key={element._id} className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-200 transition-all duration-300">
                                <img 
                                    src={element?.image?.url} 
                                    alt="Pin"
                                    className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Pin;