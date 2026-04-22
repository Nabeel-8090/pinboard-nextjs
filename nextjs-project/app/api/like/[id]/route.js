import connectToDB from "@/libs/mongodb";
import Pin from "@/models/pin";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    await connectToDB();

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const pin = await Pin.findById(id);

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          error: "Pin not found",
        },
        { status: 404 }
      );
    }

    const userLikedIndex = pin.likes.findIndex(
      (like) => like.user === token.name
    );

    if (userLikedIndex > -1) {
      // UNLIKE
      pin.likes.splice(userLikedIndex, 1);
      await pin.save();

      return NextResponse.json({
        success: true,
        message: "Unliked successfully",
      });
    } else {
      // LIKE
      pin.likes.push({
        user: token.name,
      });

      await pin.save();

      return NextResponse.json(
        {
          success: true,
          message: "Liked successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}