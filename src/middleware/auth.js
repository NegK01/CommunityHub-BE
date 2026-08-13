const { verifyToken } = require("../utils/token");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "No autorizado: falta el token");
  }

  const token = header.split(" ")[1];

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "No autorizado: token inválido o expirado");
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(401, "No autorizado: el usuario ya no existe");
  }

  req.user = user;
  next();
});

module.exports = { protect };