import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import ApiError from "../utils/ApiError";
import User, { IUserDocument } from "../models/User";
import asyncHandler from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "no autorizado: falta el token");
  }

  const token = header.split(" ")[1];

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "no autorizado: token invalido o expirado");
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(401, "no autorizado: el usuario ya no existe");
  }

  req.user = user;
  next();
});

export default { protect };
