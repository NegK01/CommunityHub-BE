import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "error interno del servidor";

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "ya existe un registro con esos datos";
  }

  if (err.name === "CastError") {
    statusCode = 404;
    message = "el recurso no existe";
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
};

export const notFound: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new ApiError(404, "ruta no encontrada"));
};

export default { errorHandler, notFound };
