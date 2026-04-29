import prisma from "@/libs/prisma";
import { getToken } from "next-auth/jwt";
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

export async function POST(request, { params }) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const { user, comment, profileImage } = await request.json();

    const pin = await prisma.pin.update({
      where: { id },
      data: {
        comments: {
          create: {
            userId: user,
            comment,
            profileImage,
          }
        }
      },
      include: { likes: true, comments: true }
    });

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      pin: mapPin(pin),
    }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: "Pin not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}