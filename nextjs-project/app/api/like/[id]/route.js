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
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    const pin = await prisma.pin.findUnique({
      where: { id },
      include: { likes: true }
    });

    if (!pin) {
      return NextResponse.json({ success: false, error: "Pin not found" }, { status: 404 });
    }

    const existingLike = pin.likes.find((like) => like.userId === token.name);

    if (existingLike) {
      // UNLIKE
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return NextResponse.json({ success: true, message: "Unliked successfully" });
    } else {
      // LIKE
      await prisma.like.create({
        data: {
          userId: token.name,
          pinId: id,
        }
      });
      return NextResponse.json({ success: true, message: "Liked successfully" }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}