import connectToDB from "@/libs/mongodb";
import PinModel from "@/models/pin";
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

    const { id } = params;

    const pin = await PinModel.findById(id);

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          error: "Pin not found",
        },
        { status: 404 }
      );
    }

    const { user, comment, profileImage } = await request.json();

    const newComment = {
      user,
      comment,
      profileImage,
    };

    pin.comments.push(newComment);

    await pin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        pin,
      },
      { status: 201 }
    );
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