import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/board/:id/pin  { pinId } → add pin to board (toggle)
// Body: { pinId: string }
export const POST = async (req, { params }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: boardId } = await params;
    const { pinId } = await req.json();

    if (!pinId) {
      return NextResponse.json({ error: "pinId is required" }, { status: 400 });
    }

    // Verify board belongs to user
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    if (board.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Toggle: if already in board, remove it; otherwise add it
    const existing = await prisma.boardPin.findUnique({
      where: { boardId_pinId: { boardId, pinId } },
    });

    if (existing) {
      await prisma.boardPin.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, saved: false, message: "Removed from board" });
    } else {
      await prisma.boardPin.create({ data: { boardId, pinId } });
      return NextResponse.json({ success: true, saved: true, message: "Saved to board" }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
