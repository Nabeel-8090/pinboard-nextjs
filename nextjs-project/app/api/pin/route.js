import cloudinary from "@/libs/cloudinary";
import connectToDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import Pin from "@/models/pin";

export const POST = async (req) => {
  try {
    await connectToDB();

    const formData = await req.formData();

    const image = formData.get("image");
    const user = formData.get("user");
    const title = formData.get("title");
    const description = formData.get("description");
    const tagsRaw = formData.get("tags") || "";

    // Validation
    if (!image || !title || !description || !user) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert tags
    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // Convert image
    const arrayBuffer = await image.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Cloudinary
    const uploadedResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "pins",
            quality: "auto",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    const pin = await Pin.create({
      user,
      title,
      description,
      tags,
      image: {
        url: uploadedResponse.secure_url,
      },
    });

    return NextResponse.json(
      { success: true, pin },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to create pin" },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    await connectToDB();

    const search = req.nextUrl.searchParams.get("search");

    let pins;

    if (search) {
      const searchRegex = new RegExp(search, "i");

      pins = await Pin.find({
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
        ],
      }).sort({ createdAt: -1 });
    } else {
      pins = await Pin.find().sort({ createdAt: -1 });
    }

    return NextResponse.json({ pins }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pins" },
      { status: 500 }
    );
  }
};