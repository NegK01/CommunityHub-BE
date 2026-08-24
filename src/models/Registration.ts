import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUserDocument } from "./User";
import { IEventDocument } from "./Event";

export type RegistrationStatus = "activa" | "cancelada";

export interface IRegistration {
  usuario: Types.ObjectId | IUserDocument;
  evento: Types.ObjectId | IEventDocument;
  fechaInscripcion: Date;
  estado: RegistrationStatus;
}

export interface IRegistrationDocument extends IRegistration, Document {
  _id: Types.ObjectId;
}

const registrationSchema = new Schema<IRegistrationDocument>({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "el usuario es requerido"]
  },
  evento: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "el evento es requerido"]
  },
  fechaInscripcion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: {
      values: ["activa", "cancelada"],
      message: "el estado no es valido"
    },
    default: "activa"
  }
});

registrationSchema.index({ usuario: 1, evento: 1 }, { unique: true });
registrationSchema.index({ evento: 1, estado: 1 });

export const Registration: Model<IRegistrationDocument> = mongoose.model<IRegistrationDocument>(
  "Registration",
  registrationSchema
);
export default Registration;
