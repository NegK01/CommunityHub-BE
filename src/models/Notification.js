const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es requerido"]
    },
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null
    },
    tipo: {
      type: String,
      enum: {
        values: ["recordatorio", "inscripcion", "cancelacion", "sistema"],
        message: "El tipo no es válido"
      },
      default: "sistema"
    },
    titulo: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true
    },
    mensaje: {
      type: String,
      required: [true, "El mensaje es requerido"],
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

module.exports = mongoose.model("Notification", notificationSchema);