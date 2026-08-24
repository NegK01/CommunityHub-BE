import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ICategoryDocument } from "./Category";
import { IUserDocument } from "./User";

export type EventStatus = "activo" | "cancelado" | "finalizado";

export interface IEvent {
  titulo: string;
  descripcion: string;
  categoria: Types.ObjectId | ICategoryDocument;
  fecha: Date;
  hora: string;
  ubicacion: string;
  capacidadMaxima: number;
  imagen?: string | null;
  organizador: Types.ObjectId | IUserDocument;
  estado: EventStatus;
  createdAt?: Date;
}

export interface IEventDocument extends IEvent, Document {
  _id: Types.ObjectId;
  participantes?: number;
  espaciosDisponibles?: number;
}

const eventSchema = new Schema<IEventDocument>(
  {
    titulo: {
      type: String,
      required: [true, "el titulo es requerido"],
      trim: true
    },
    descripcion: {
      type: String,
      required: [true, "la descripcion es requerida"],
      trim: true
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "la categoria es requerida"]
    },
    fecha: {
      type: Date,
      required: [true, "la fecha es requerida"],
      validate: {
        validator: (value: Date) => value >= new Date(new Date().setHours(0, 0, 0, 0)),
        message: "no se permiten fechas pasadas"
      }
    },
    hora: {
      type: String,
      required: [true, "la hora es requerida"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "la hora debe estar en formato 24 horas (HH:MM)"]
    },
    ubicacion: {
      type: String,
      required: [true, "la ubicacion es requerida"],
      trim: true
    },
    capacidadMaxima: {
      type: Number,
      required: [true, "la capacidad maxima es requerida"],
      default: 50,
      min: [1, "la capacidad maxima debe ser al menos 1"]
    },
    imagen: {
      type: String,
      default: null
    },
    organizador: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "el organizador es requerido"]
    },
    estado: {
      type: String,
      enum: {
        values: ["activo", "cancelado", "finalizado"],
        message: "el estado no es valido"
      },
      default: "activo"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

eventSchema.index({ categoria: 1, fecha: 1 });
eventSchema.index({ organizador: 1, estado: 1 });
eventSchema.index({ titulo: "text", descripcion: "text" });

eventSchema.virtual("participantes", {
  ref: "Registration",
  localField: "_id",
  foreignField: "evento",
  match: { estado: "activa" },
  count: true
});

eventSchema.virtual("espaciosDisponibles").get(function (this: IEventDocument) {
  if (this.participantes === undefined) return undefined;
  return this.capacidadMaxima - this.participantes;
});

export const Event: Model<IEventDocument> = mongoose.model<IEventDocument>("Event", eventSchema);
export default Event;
