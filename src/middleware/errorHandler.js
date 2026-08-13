const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Ya existe un registro con esos datos";
  }

  if (err.name === "CastError") {
    statusCode = 404;
    message = "El recurso no existe";
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
};

const notFound = (req, res, next) => {
  next(new ApiError(404, "Ruta no encontrada"));
};

module.exports = { errorHandler, notFound };