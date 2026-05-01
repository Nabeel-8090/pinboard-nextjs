import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

const mapPin = (pin) => ({
  _id: pin.id,
  id: pin.id,
  user: pin.user
    ? { id: pin.user.id, username: pin.user.username, image: pin.user.image }
    : { id: pin.userId },
  title: pin.title,
  description: pin.description,
  tags: pin.tags,
  image: { url: pin.imageUrl },
  likes: pin.likes ? pin.likes.map((l) => ({ userId: l.userId })) : [],
  // FIX: removed c.profileImage which doesn't exist in schema
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

export async function GET(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const pins = await prisma.pin.findMany({
      where: { userId: id },
      include: {
        user: true,
        likes: true,
        comments: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // FIX: wrap in { pins: [...] } so response is consistent with other endpoints
    return NextResponse.json({ pins: pins.map(mapPin) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
