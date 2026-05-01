import cloudinary from "@/libs/cloudinary";
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// FIX: include user relation so owner name/image is available on each pin
const PIN_INCLUDE = {
  user: true,
  likes: true,
  comments: {
    include: { user: true },
  },
};

const mapPin = (pin) => ({
  _id: pin.id,
  id: pin.id,
  // FIX: send full user object (name + image) instead of raw userId string
  user: pin.user
    ? { id: pin.user.id, username: pin.user.username, image: pin.user.image }
    : { id: pin.userId },
  title: pin.title,
  description: pin.description,
  tags: pin.tags,
  image: { url: pin.imageUrl },
  likes: pin.likes ? pin.likes.map((l) => ({ userId: l.userId })) : [],
  comments: pin.comments
    ? pin.comments.map((c) => ({
        id: c.id,
        comment: c.comment,
        commentedOn: c.commentedOn,
        user: c.user ?? null,
      }))
    : [],
  createdAt: pin.createdAt,
  updatedAt: pin.updatedAt,
});

export const POST = async (req) => {
  try {
    // FIX: get userId from session, never from request body
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const title = formData.get("title");
    const description = formData.get("description");
    const tagsRaw = formData.get("tags") || "";

    if (!image || !title || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const arrayBuffer = await image.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const uploadedResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "pins", quality: "auto", fetch_format: "auto" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    const pin = await prisma.pin.create({
      data: {
        userId: session.user.id, // FIX: use authenticated session user id
        title,
        description,
        tags,
        imageUrl: uploadedResponse.secure_url,
      },
      include: PIN_INCLUDE,
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
        include: PIN_INCLUDE,
        orderBy: { createdAt: "desc" },
      });

      const searchRegex = new RegExp(search, "i");
      const allPins = await prisma.pin.findMany({
        include: PIN_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      const tagMatched = allPins.filter(
        (p) =>
          p.tags.some((t) => searchRegex.test(t)) &&
          !pins.find((existing) => existing.id === p.id)
      );
      pins = [...pins, ...tagMatched];
      pins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      pins = await prisma.pin.findMany({
        include: PIN_INCLUDE,
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
