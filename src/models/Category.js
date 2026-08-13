const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
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
      match: [/^#([0-9A-Fa-f]{6})$/, "El color debe ser un código hexadecimal válido"]
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

module.exports = mongoose.model("Category", categorySchema);