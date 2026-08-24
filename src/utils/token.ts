import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { IUserDocument, UserRole } from "../models/User";

export interface TokenPayload {
  id: string;
  rol: UserRole;
}

export const generateToken = (user: IUserDocument | { _id: any; rol: UserRole }): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    rol: user.rol
  };

  const secret: Secret = process.env.JWT_SECRET || "default_jwt_secret";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret: Secret = process.env.JWT_SECRET || "default_jwt_secret";
  return jwt.verify(token, secret) as TokenPayload;
};

export default { generateToken, verifyToken };
