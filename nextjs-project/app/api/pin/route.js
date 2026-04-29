import cloudinary from "@/libs/cloudinary";
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

const mapPin = (pin) => ({
  _id: pin.id,
  user: pin.userId,
  title: pin.title,
  description: pin.description,
  tags: pin.tags,
  image: { url: pin.imageUrl },
  likes: pin.likes ? pin.likes.map(l => ({ user: l.userId })) : [],
  comments: pin.comments ? pin.comments.map(c => ({ user: c.userId, profileImage: c.profileImage, comment: c.comment, commentedOn: c.commentedOn })) : [],
  createdAt: pin.createdAt,
  updatedAt: pin.updatedAt,
});

export const POST = async (req) => {
  try {
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

    const pin = await prisma.pin.create({
      data: {
        userId: user,
        title,
        description,
        tags,
        imageUrl: uploadedResponse.secure_url,
      },
      include: {
        likes: true,
        comments: true,
      }
    });

    return NextResponse.json(
      { success: true, pin: mapPin(pin) },
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
    const search = req.nextUrl.searchParams.get("search");

    let pins;

    if (search) {
      pins = await prisma.pin.findMany({
        where: {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          likes: true,
          comments: true,
        },
        orderBy: { createdAt: "desc" },
      });
      
      // Filter pins that might match tags (since Prisma has doesn't support case-insensitive contains easily for arrays)
      const searchRegex = new RegExp(search, "i");
      const extraPins = await prisma.pin.findMany({
        include: { likes: true, comments: true },
        orderBy: { createdAt: "desc" }
      });
      
      const tagMatched = extraPins.filter(p => p.tags.some(t => searchRegex.test(t)) && !pins.find(existing => existing.id === p.id));
      pins = [...pins, ...tagMatched];
      
      // Re-sort
      pins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
    } else {
      pins = await prisma.pin.findMany({
        include: {
          likes: true,
          comments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ pins: pins.map(mapPin) }, { status: 200 });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pins" },
      { status: 500 }
    );
  }
};