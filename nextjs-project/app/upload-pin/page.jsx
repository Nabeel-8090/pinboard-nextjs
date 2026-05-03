"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import React, { useState, useRef } from "react";

const UploadPin = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const { data: session } = useSession();

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File is too large! Max 5MB.");
    }

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  //  Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.email) {
      return toast.error("You must be logged in!");
    }

    if (!image) return toast.warn("Please upload an image!");
    if (!title.trim()) return toast.warn("Title is required!");
    if (!description.trim())
      return toast.warn("Description is required!");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("user", session.user.id);

    try {
      setLoading(true);

      const res = await axios.post("/api/pin", formData);

      if (res.status === 201) {
        toast.success("Pin published successfully!");

        // Reset form
        setTitle("");
        setDescription("");
        setTags("");
        setImage(null);
        setImagePreview("");

        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Upload failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-12 px-4 sm:px-6">

      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-blue-100 overflow-hidden border border-blue-50">
        <div className="flex flex-col md:flex-row">

          {/* LEFT: IMAGE UPLOAD */}
          <div className="w-full md:w-5/12 bg-blue-50/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-blue-100">
            <div
              onClick={() => fileInputRef.current.click()}
              className={`group relative w-full aspect-[4/5] bg-white border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${imagePreview
                  ? "border-blue-400"
                  : "border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                }`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <p className="text-white font-medium bg-blue-600/80 px-4 py-2 rounded-full text-sm">
                      Change Image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="bg-blue-600 p-4 rounded-2xl mb-4 inline-block shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-blue-900 font-bold">Upload Image</p>
                  <p className="text-xs text-blue-400 mt-2">
                    Supports JPG, PNG, GIF
                  </p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImage}
                accept="image/*"
              />
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div className="w-full md:w-7/12 p-8 lg:p-10">
            <header className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-blue-950 tracking-tight">
                Create Pin
              </h2>
              <div className="h-1 w-12 bg-blue-500 mt-2 rounded-full hidden md:block"></div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* TITLE */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-blue-900 ml-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                  className="w-full px-5 py-3.5 rounded-2xl bg-blue-50/30 border border-blue-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-blue-300"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-blue-900 ml-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this pin about?"
                  className="w-full px-5 py-3.5 rounded-2xl bg-blue-50/30 border border-blue-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none placeholder:text-blue-300"
                />
              </div>

              {/* TAGS */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-blue-900 ml-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="art, nature, coding"
                  className="w-full px-5 py-3.5 rounded-2xl bg-blue-50/30 border border-blue-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-blue-300"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-4 rounded-2xl font-bold text-white transition-all shadow-xl ${loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Publishing...
                  </span>
                ) : (
                  "Publish Pin"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPin;