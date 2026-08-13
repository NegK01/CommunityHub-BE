const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es requerida"],
      trim: true
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es requerida"]
    },
    fecha: {
      type: Date,
      required: [true, "La fecha es requerida"],
      validate: {
        validator: (value) => value >= new Date(),
        message: "No se permiten fechas pasadas"
      }
    },
    hora: {
      type: String,
      required: [true, "La hora es requerida"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe estar en formato 24 horas (HH:MM)"]
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicación es requerida"],
      trim: true
    },
    capacidadMaxima: {
      type: Number,
      required: [true, "La capacidad máxima es requerida"],
      default: 50,
      min: [1, "La capacidad máxima debe ser al menos 1"]
    },
    imagen: {
      type: String,
      default: null
    },
    organizador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El organizador es requerido"]
    },
    estado: {
      type: String,
      enum: {
        values: ["activo", "cancelado", "finalizado"],
        message: "El estado no es válido"
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

eventSchema.virtual("espaciosDisponibles").get(function () {
  if (this.participantes === undefined) return undefined;
  return this.capacidadMaxima - this.participantes;
});

module.exports = mongoose.model("Event", eventSchema);