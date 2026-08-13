const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es requerido"]
    },
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "El evento es requerido"]
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

favoriteSchema.index({ usuario: 1, evento: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);