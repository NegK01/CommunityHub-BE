const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El usuario es requerido"]
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "El evento es requerido"]
  },
  fechaInscripcion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: {
      values: ["activa", "cancelada"],
      message: "El estado no es válido"
    },
    default: "activa"
  }
});

registrationSchema.index({ usuario: 1, evento: 1 }, { unique: true });
registrationSchema.index({ evento: 1, estado: 1 });

module.exports = mongoose.model("Registration", registrationSchema);