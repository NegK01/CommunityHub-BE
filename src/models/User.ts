import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "organizer" | "user";

export interface IUser {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  fotoPerfil?: string | null;
  rol: UserRole;
  createdAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    nombre: {
      type: String,
      required: [true, "el nombre es requerido"],
      trim: true
    },
    apellido: {
      type: String,
      required: [true, "el apellido es requerido"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "el correo es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/, "el correo no es valido"]
    },
    password: {
      type: String,
      required: [true, "la contrasena es requerida"],
      minlength: [6, "la contrasena debe tener al menos 6 caracteres"],
      select: false,
      trim: true
    },
    fotoPerfil: {
      type: String,
      default: null
    },
    rol: {
      type: String,
      enum: {
        values: ["admin", "organizer", "user"],
        message: "el rol no es valido"
      },
      default: "user"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || "");
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema);
export default User;
