import prisma from "@/libs/prisma";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const pin = await prisma.pin.findUnique({
      where: { id },
      include: { likes: true },
    });

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Pin not found" },
        { status: 404 }
      );
    }

    const existingLike = pin.likes.find((like) => like.userId === token.id);

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      // FIX: return liked: false so frontend setIsLiked(data.liked) works correctly
      return NextResponse.json({
        success: true,
        liked: false,
        message: "Unliked successfully",
      });
    } else {
      await prisma.like.create({
        data: { userId: token.id, pinId: id },
      });
      // FIX: return liked: true
      return NextResponse.json(
        { success: true, liked: true, message: "Liked successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
