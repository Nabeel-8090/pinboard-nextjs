import React from 'react'

const Comment = ({ user, comment, profileImage }) => {
    return (
        <div className='flex items-start space-x-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300'>
            <img
                src={profileImage || "/avatar.png"}
                className='w-9 h-9 rounded-full object-cover border-2 border-blue-50 shadow-sm'
                alt={user}
            />
            <div className='flex flex-col max-w-[85%]'>
                <div className='bg-blue-50/80 px-4 py-2 rounded-2xl rounded-tl-none'>
                    <h4 className='font-bold text-blue-900 text-xs uppercase tracking-wider mb-0.5'>{user}</h4>
                    <p className='text-slate-700 text-sm leading-snug'>{comment}</p>
                </div>
            </div>
        </div>
    )
}

export default Comment