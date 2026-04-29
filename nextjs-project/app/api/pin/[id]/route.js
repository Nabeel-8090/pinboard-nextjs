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

export const GET = async (req, { params }) => {
    try {
        const { id } = await params;
        const pin = await prisma.pin.findUnique({
            where: { id },
            include: { likes: true, comments: true }
        });
        if (!pin) return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        return NextResponse.json({ success: true, pin: mapPin(pin) }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const { id } = await params;
        const { user, profileImage, comment } = await req.json();
        
        if (!comment) return NextResponse.json({ error: "Comment is empty" }, { status: 400 });

        const pin = await prisma.pin.update({
            where: { id },
            data: {
                comments: {
                    create: {
                        userId: user,
                        profileImage,
                        comment
                    }
                }
            },
            include: { likes: true, comments: true }
        });
        
        return NextResponse.json({ success: true, pin: mapPin(pin) }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};