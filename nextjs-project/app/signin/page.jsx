"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { ClipLoader } from "react-spinners"

const Page = () => {
    const { data: session } = useSession()
    const router = useRouter()

    const [form, setForm] = useState({
        username: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (session) router.push("/")
    }, [session, router])

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleCredentialLogin = async () => {
        if (!form.username || !form.password) {
            toast.error("Please fill all fields")
            return
        }

        try {
            setLoading(true)

            const res = await signIn("credentials", {
                redirect: false,
                username: form.username,
                password: form.password
            })

            if (res?.ok) {
                toast.success("Login successful 🎉")
                router.push("/")
            } else {
                toast.error("Invalid username or password")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleCredentialLogin()
        }
    }

    return (
        /* Consistency: Removed fixed constraints, added py-6 and overflow-y-auto for laptop screens */
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-100 py-6 px-4 overflow-y-auto">

            {/* Consistency: Same max-w-sm and rounded corners as your Signup */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-sm w-full my-auto transition-all duration-300 hover:shadow-2xl">

                {/* Logo: Reduced height to match Signup (h-20) */}
                <div className="flex justify-center mb-1">
                    <img
                        src="/logoo.jpg"
                        alt="Logo"
                        className="h-20 w-auto object-contain"
                    />
                </div>

                {/* Heading: Tightened margins */}
                <div className="text-center mb-5">
                    <h2 className="text-xl font-bold text-gray-800">Welcome Back 👋</h2>
                    <p className="text-gray-500 text-xs">Login to continue to PinBoard</p>
                </div>

                {/* Inputs: Consistent spacing and text size */}
                <div className="space-y-3">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />

                    {/* Login Button */}
                    <button
                        onClick={handleCredentialLogin}
                        disabled={loading}
                        className="w-full p-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center shadow-md text-sm mt-2"
                    >
                        {loading ? <ClipLoader color="#fff" size={18} /> : "Continue"}
                    </button>
                </div>

                {/* Divider: Consistent with Signup layout */}
                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <span className="px-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>

                {/* OAuth Buttons: Tightened for consistency */}
                <div className="space-y-2">
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                    >
                        <img src="/github.webp" alt="Github" className="w-4 h-4 invert" />
                        <span className="text-xs font-medium">Continue with GitHub</span>
                    </button>

                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 p-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <img src="/google.svg" alt="Google" className="w-4 h-4" />
                        <span className="text-xs font-medium">Continue with Google</span>
                    </button>
                </div>

                {/* Footer: Reduced margin */}
                <p className="text-center text-xs text-gray-600 mt-5">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                        Register
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default Page