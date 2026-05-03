import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/board/:id   → single board details with all pins
// DELETE /api/board/:id → delete board (owner only)
export const GET = async (req, { params }) => {
  try {
    const { id } = await params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, image: true } },
        pins: {
          include: {
            pin: {
              include: {
                likes: true,
                comments: true,
                user: { select: { id: true, username: true, image: true } },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const mapped = {
      id: board.id,
      name: board.name,
      description: board.description,
      coverImage: board.coverImage || board.pins[0]?.pin?.imageUrl || null,
      owner: board.user,
      pinCount: board.pins.length,
      pins: board.pins.map((bp) => ({
        id: bp.pin.id,
        _id: bp.pin.id,
        title: bp.pin.title,
        description: bp.pin.description,
        tags: bp.pin.tags,
        image: { url: bp.pin.imageUrl },
        likes: bp.pin.likes.map((l) => ({ userId: l.userId })),
        comments: bp.pin.comments,
        user: bp.pin.user,
        addedAt: bp.addedAt,
        createdAt: bp.pin.createdAt,
      })),
      createdAt: board.createdAt,
    };

    return NextResponse.json({ board: mapped }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const DELETE = async (req, { params }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    if (board.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.board.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
