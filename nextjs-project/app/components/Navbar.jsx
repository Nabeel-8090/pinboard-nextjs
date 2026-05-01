"use client";

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, X, Plus, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query)}`);
      setQuery("");
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Create', href: '/upload-pin' },
  ];

  return (
    <nav className='sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm px-4 md:px-8 py-2'>
      <div className='flex items-center justify-between container mx-auto gap-4'>
        
        {/* LEFT */}
        <div className='flex items-center gap-2 md:gap-6'>
          <Link href="/" className="flex-shrink-0">
            <img src="/logoo.jpg" alt="Logo" className='w-17 h-15'/>
          </Link>

          <div className='hidden md:flex items-center gap-1'>
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                  ${pathname === link.href ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <div className='hidden sm:block flex-grow max-w-3xl'>
          <form onSubmit={handleSearch} className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input 
              type="text" 
              placeholder='Search for inspiration...' 
              className='w-full py-2.5 pl-12 pr-4 bg-gray-100 rounded-full focus:outline-none'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>

        {/* RIGHT */}
        <div className='flex items-center gap-2 md:gap-4'>
          {session ? (
            <div className='relative' ref={dropdownRef}>
              
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                <img
                  src={session?.user?.image || "/avatar.png"}
                  alt="Profile"
                  className='w-10 h-10 rounded-full object-cover'
                />
              </button>

              {dropdownOpen && (
                <div className='absolute right-0 mt-2 w-56 bg-white shadow-xl border rounded-2xl py-2 z-50'>

                  <div className="px-4 py-2 border-b">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold truncate">
                      {session?.user?.email}
                    </p>
                  </div>

                  {/* PROFILE (FIXED) */}
                  <button
                    onClick={() => {
                      if (session?.user?.id) {
                        router.push(`/profile/${session.user.id}`);
                        setDropdownOpen(false);
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-50"
                  >
                    <User size={18} /> Profile
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-blue-500 w-full text-left hover:bg-blue-50"
                  >
                    <LogOut size={18} /> Logout
                  </button>

                </div>
              )}
            </div>
          ) : (
            <Link href="/signin" className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700">
              Log in
            </Link>
          )}

          {/* MOBILE MENU */}
          <button 
            className='p-2 sm:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;