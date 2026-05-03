import cloudinary from "@/libs/cloudinary";
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!image) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "Username, email, and password are required." },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const uploadedResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "pinboard_users" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(buffer);
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        image: uploadedResponse.secure_url,
      },
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json(
      {
        success: true,
        message: "User registered",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }
    console.error("User registration failed:", error);
    return NextResponse.json(
      { error: "User registration failed" },
      { status: 500 }
    );
  }
}