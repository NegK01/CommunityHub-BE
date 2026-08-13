const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true
    },
    apellido: {
      type: String,
      required: [true, "El apellido es requerido"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "El correo es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/, "El correo no es válido"]
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
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
        message: "El rol no es válido"
      },
      default: "user"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);