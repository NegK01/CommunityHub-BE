import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/token";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, apellido, email, password, fotoPerfil } = req.body;

  if (!nombre || !apellido || !email || !password) {
    throw new ApiError(400, "todos los campos son requeridos");
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "el correo ya esta registrado");
  }

  const user = await User.create({
    nombre,
    apellido,
    email,
    password,
    fotoPerfil: fotoPerfil || null
  });

  const token = generateToken(user);
  res.status(201).json({ success: true, data: { user, token } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "el correo y la contrasena son requeridos");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "credenciales invalidas");
  }

  const token = generateToken(user);
  res.status(200).json({ success: true, data: { user, token } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "sesion cerrada correctamente" });
});

export default { register, login, me, logout };
