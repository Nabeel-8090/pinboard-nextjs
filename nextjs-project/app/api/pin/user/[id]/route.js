import prisma from "@/libs/prisma";

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

export async function GET(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const pins = await prisma.pin.findMany({
      where: { userId: id },
      include: { likes: true, comments: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(pins.map(mapPin));
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}