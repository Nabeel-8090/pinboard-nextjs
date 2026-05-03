import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/board?userId=xxx  → list boards for a user
// POST /api/board             → create a new board (auth required)
export const GET = async (req) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const boards = await prisma.board.findMany({
      where: { userId },
      include: {
        pins: {
          include: {
            pin: {
              select: { id: true, imageUrl: true, title: true },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = boards.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      coverImage: b.coverImage || b.pins[0]?.pin?.imageUrl || null,
      pinCount: b.pins.length,
      pins: b.pins.map((bp) => ({
        id: bp.pin.id,
        imageUrl: bp.pin.imageUrl,
        title: bp.pin.title,
        addedAt: bp.addedAt,
      })),
      createdAt: b.createdAt,
    }));

    return NextResponse.json({ boards: mapped }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Board name is required" }, { status: 400 });
    }

    const board = await prisma.board.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, board }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
