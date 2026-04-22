import connectToDB from "@/libs/mongodb";
import Pin from "@/models/pin";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectToDB();
        const { id } = await params;
        const pin = await Pin.findById(id);
        if (!pin) return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        return NextResponse.json({ success: true, pin }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        await connectToDB();
        const { id } = await params;
        const { user, profileImage, comment } = await req.json();
        
        if (!comment) return NextResponse.json({ error: "Comment is empty" }, { status: 400 });

        const pin = await Pin.findByIdAndUpdate(
            id,
            { $push: { comments: { user, profileImage, comment } } },
            { new: true }
        );
        
        return NextResponse.json({ success: true, pin }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};