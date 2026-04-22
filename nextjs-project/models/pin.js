import mongoose from "mongoose";

const pinSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    image: {
      url: {
        type: String,
        required: true,
      },
    },
    likes: [
      {
        user: String,
      },
    ],
    comments: [
      {
        user: String,
        profileImage: String,
        comment: String,
        commentedOn: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Pin || mongoose.model("Pin", pinSchema);