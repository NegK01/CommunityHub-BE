import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../models/User";

export const authorize = (...roles: UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "no autorizado");
    }
    if (!roles.includes(req.user.rol)) {
      throw new ApiError(403, "no tiene permisos para realizar esta accion");
    }
    next();
  };
};

export default authorize;
