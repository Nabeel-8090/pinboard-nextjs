import connectToDB from "@/libs/mongodb";
import Pin from "@/models/pin";

export async function GET(req, context) {
  try {
    await connectToDB();

    const { params } = context;
    const { id } = await params; // ✅ IMPORTANT FIX

    const pins = await Pin.find({ user: id }).sort({
      createdAt: -1,
    });

    return Response.json(pins);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}