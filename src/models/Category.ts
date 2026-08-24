import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategory {
  nombre: string;
  descripcion?: string;
  color?: string;
  activa: boolean;
  createdAt?: Date;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    nombre: {
      type: String,
      required: [true, "el nombre es requerido"],
      unique: true,
      trim: true
    },
    descripcion: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: "#4F46E5",
      match: [/^#([0-9A-Fa-f]{6})$/, "el color debe ser un codigo hexadecimal valido"]
    },
    activa: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>("Category", categorySchema);
export default Category;
