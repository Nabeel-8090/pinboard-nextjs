import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const PIN_INCLUDE = {
  user: true, // FIX: include pin owner
  likes: true,
  comments: {
    include: { user: true },
  },
};

const mapPin = (pin) => ({
  _id: pin.id,
  id: pin.id,
  // FIX: full owner object so pin detail page can show name + avatar
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

export const GET = async (req, { params }) => {
  try {
    const { id } = await params;
    const pin = await prisma.pin.findUnique({
      where: { id },
      include: PIN_INCLUDE,
    });
    if (!pin)
      return NextResponse.json({ error: "Pin not found" }, { status: 404 });
    return NextResponse.json(
      { success: true, pin: mapPin(pin) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const PATCH = async (req, { params }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { comment } = await req.json();

    if (!comment?.trim()) {
      return NextResponse.json({ error: "Comment is empty" }, { status: 400 });
    }

    const pin = await prisma.pin.update({
      where: { id },
      data: {
        comments: {
          create: {
            userId: session.user.id,
            comment,
          },
        },
      },
      include: PIN_INCLUDE,
    });

    return NextResponse.json(
      { success: true, pin: mapPin(pin) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
