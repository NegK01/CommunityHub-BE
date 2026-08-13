const User = require("../models/User");
const { generateToken } = require("../utils/token");
const ApiError = require("../utils/ApiError");

const toPublicUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

const register = async ({ nombre, apellido, email, password, fotoPerfil }) => {
  if (!nombre || !apellido || !email || !password) {
    throw new ApiError(400, "Todos los campos son requeridos");
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "El correo ya está registrado");
  }

  const user = await User.create({ nombre, apellido, email, password, fotoPerfil });
  const token = generateToken(user);

  return { user: toPublicUser(user), token };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "El correo y la contraseña son requeridos");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const token = generateToken(user);

  return { user: toPublicUser(user), token };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }
  return user;
};

const logout = () => {
  return { message: "Sesión cerrada correctamente" };
};

module.exports = { register, login, getMe, logout };