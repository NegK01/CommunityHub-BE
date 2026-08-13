const ApiError = require("../utils/ApiError");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "No autorizado");
    }
    if (!roles.includes(req.user.rol)) {
      throw new ApiError(403, "No tiene permisos para realizar esta acción");
    }
    next();
  };
};

module.exports = authorize;