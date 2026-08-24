import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUserDocument } from "./User";
import { IEventDocument } from "./Event";

export type NotificationType = "recordatorio" | "inscripcion" | "cancelacion" | "sistema";

export interface INotification {
  usuario: Types.ObjectId | IUserDocument;
  evento?: Types.ObjectId | IEventDocument | null;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt?: Date;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "el usuario es requerido"]
    },
    evento: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null
    },
    tipo: {
      type: String,
      enum: {
        values: ["recordatorio", "inscripcion", "cancelacion", "sistema"],
        message: "el tipo no es valido"
      },
      default: "sistema"
    },
    titulo: {
      type: String,
      required: [true, "el titulo es requerido"],
      trim: true
    },
    mensaje: {
      type: String,
      required: [true, "el mensaje es requerido"],
      trim: true
    },
    leida: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

notificationSchema.index({ usuario: 1, leida: 1 });
notificationSchema.index({ usuario: 1, createdAt: -1 });

export const Notification: Model<INotificationDocument> = mongoose.model<INotificationDocument>(
  "Notification",
  notificationSchema
);
export default Notification;
