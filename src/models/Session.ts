import { Schema, model, models, Types } from "mongoose";

export interface IHomeworkItem {
  title: string;
  detail: string;
}

export interface ILineItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface ISession {
  tutorId: Types.ObjectId;
  studentName: string;
  parentName: string;
  subject: string;
  heldAt: Date;
  durationHours: number;
  rate: number;
  currency: string;
  rawNotes: string;
  parentRecap: string;
  studentHomework: IHomeworkItem[];
  topicsCovered: string[];
  nextSessionFocus: string;
  invoiceNotes: string;
  lineItems: ILineItem[];
  total: number;
  status: "draft" | "sent";
  modelUsed: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: "Tutor", required: true, index: true },
    studentName: { type: String, required: true, trim: true, maxlength: 80 },
    parentName: { type: String, default: "", trim: true, maxlength: 80 },
    subject: { type: String, default: "", trim: true, maxlength: 80 },
    heldAt: { type: Date, default: Date.now },
    durationHours: { type: Number, required: true, min: 0.25 },
    rate: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    rawNotes: { type: String, default: "", maxlength: 12_000 },
    parentRecap: { type: String, default: "" },
    studentHomework: {
      type: [
        {
          title: { type: String, required: true },
          detail: { type: String, default: "" },
        },
      ],
      default: [],
    },
    topicsCovered: { type: [String], default: [] },
    nextSessionFocus: { type: String, default: "" },
    invoiceNotes: { type: String, default: "" },
    lineItems: {
      type: [
        {
          description: String,
          hours: Number,
          rate: Number,
          amount: Number,
        },
      ],
      default: [],
    },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "sent"], default: "draft" },
    modelUsed: { type: String, default: "" },
  },
  { timestamps: true },
);

SessionSchema.index({ tutorId: 1, heldAt: -1 });

export const Session = models.Session || model<ISession>("Session", SessionSchema);
