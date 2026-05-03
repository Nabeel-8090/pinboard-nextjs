"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const SignUp = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            router.push("/");
        }
    }, [session, router]);

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImagePreview(reader.result);
        };
    };

    const handleUserRegister = async () => {
        if (!username || !email || !password || !image) {
            toast.error("Please provide all required details");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("image", image);

            await axios.post("/api/auth/register", formData);
            toast.success("Account created successfully!");
            router.push("/signin");
        } catch (error) {
            toast.error(error.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* IMPROVEMENTS:
           1. Reduced py-12 to py-6 to save 48px of vertical space.
           2. Added overflow-y-auto to the parent so it's scrollable if the screen is tiny.
        */
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-100 py-6 px-4 overflow-y-auto">
            
            {/* Added max-h-fit to ensure the card doesn't stretch unnecessarily */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-sm w-full my-auto">

                {/* Logo: Reduced mb-2 and set a fixed max-height to save space */}
                <div className="flex justify-center mb-1">
                    <img
                        src="/logoo.jpg"
                        alt="Logo"
                        className="h-20 w-auto object-contain"
                    />
                </div>

                {/* Header: Reduced mb-8 to mb-4 */}
                <div className="text-center mb-5">
                    <h2 className="text-xl font-bold text-gray-800">Welcome to PinBoard</h2>
                    <p className="text-gray-500 text-xs">Find new ideas to try</p>
                </div>

                {/* Inputs: Reduced space-y-4 to space-y-3 */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Avatar Upload: Tightened padding */}
                    <div className="flex items-center space-x-3 py-1">
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <img
                                src={imagePreview || "/avatar.png"}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                        </div>

                        <label className={`flex-1 text-center text-xs font-medium text-white px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            imagePreview ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"
                        }`}>
                            {imagePreview ? "Selected" : "Choose Avatar"}
                            <input type="file" className="hidden" onChange={handleImage} accept="image/*" />
                        </label>
                    </div>

                    {/* Register Button */}
                    <button
                        onClick={handleUserRegister}
                        disabled={loading}
                        className="w-full p-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center shadow-md text-sm"
                    >
                        {loading ? <ClipLoader color="#fff" size={18} /> : "Continue"}
                    </button>
                </div>

                {/* Divider: Reduced vertical margin from my-6 to my-4 */}
                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <span className="px-3 text-gray-400 text-[10px] font-bold">OR</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>

                {/* Social Buttons: Tightened padding and text */}
                <div className="space-y-2">
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                    >
                        <img src="/github.webp" alt="GitHub" className="w-4 h-4 invert" />
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

                {/* Login link: Reduced mt-8 to mt-4 */}
                <p className="text-center text-xs text-gray-600 mt-5">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-blue-600 font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;