import { Schema, model, models } from "mongoose";

export interface ITutor {
  name: string;
  subjects: string;
  hourlyRate: number;
  currency: string;
  parentTone: string;
  createdAt: Date;
  updatedAt: Date;
}

const TutorSchema = new Schema<ITutor>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    subjects: { type: String, default: "Maths & Physics", trim: true, maxlength: 160 },
    hourlyRate: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", uppercase: true, maxlength: 8 },
    parentTone: {
      type: String,
      default: "Warm, specific, no fluff. WhatsApp-length. Never shame the student.",
      maxlength: 400,
    },
  },
  { timestamps: true },
);

export const Tutor = models.Tutor || model<ITutor>("Tutor", TutorSchema);
