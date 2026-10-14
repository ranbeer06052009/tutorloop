import type { IHomeworkItem, ILineItem, ISession } from "@/models/Session";
import type { ITutor } from "@/models/Tutor";

export type TutorDTO = {
  id: string;
  name: string;
  subjects: string;
  hourlyRate: number;
  currency: string;
  parentTone: string;
};

export type SessionDTO = {
  id: string;
  tutorId: string;
  studentName: string;
  parentName: string;
  subject: string;
  heldAt: string;
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
  createdAt: string;
};

export function toTutorDTO(doc: ITutor & { _id: unknown }): TutorDTO {
  return {
    id: String(doc._id),
    name: doc.name,
    subjects: doc.subjects,
    hourlyRate: doc.hourlyRate,
    currency: doc.currency,
    parentTone: doc.parentTone,
  };
}

export function toSessionDTO(doc: ISession & { _id: unknown }): SessionDTO {
  return {
    id: String(doc._id),
    tutorId: String(doc.tutorId),
    studentName: doc.studentName,
    parentName: doc.parentName,
    subject: doc.subject,
    heldAt: new Date(doc.heldAt).toISOString(),
    durationHours: doc.durationHours,
    rate: doc.rate,
    currency: doc.currency,
    rawNotes: doc.rawNotes,
    parentRecap: doc.parentRecap,
    studentHomework: doc.studentHomework,
    topicsCovered: doc.topicsCovered,
    nextSessionFocus: doc.nextSessionFocus,
    invoiceNotes: doc.invoiceNotes,
    lineItems: doc.lineItems,
    total: doc.total,
    status: doc.status,
    modelUsed: doc.modelUsed,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}
