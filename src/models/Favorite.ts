import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUserDocument } from "./User";
import { IEventDocument } from "./Event";

export interface IFavorite {
  usuario: Types.ObjectId | IUserDocument;
  evento: Types.ObjectId | IEventDocument;
  createdAt?: Date;
}

export interface IFavoriteDocument extends IFavorite, Document {
  _id: Types.ObjectId;
}

const favoriteSchema = new Schema<IFavoriteDocument>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "el usuario es requerido"]
    },
    evento: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "el evento es requerido"]
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

favoriteSchema.index({ usuario: 1, evento: 1 }, { unique: true });

export const Favorite: Model<IFavoriteDocument> = mongoose.model<IFavoriteDocument>(
  "Favorite",
  favoriteSchema
);
export default Favorite;
