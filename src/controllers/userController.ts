import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import Favorite from "../models/Favorite";
import Notification from "../models/Notification";
import Registration from "../models/Registration";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
export { getMyRegistrations } from "./registrationController";
export { getMyFavorites } from "./favoriteController";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, rol } = req.query;
  const filter: any = {};

  if (search) {
    const searchRegex = new RegExp(String(search).trim(), "i");
    filter.$or = [{ nombre: searchRegex }, { apellido: searchRegex }, { email: searchRegex }];
  }

  if (rol) {
    filter.rol = rol;
  }

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const isSelf = req.user!._id.toString() === req.params.id;
  const isAdmin = req.user!.rol === "admin";

  if (!isSelf && !isAdmin) {
    throw new ApiError(403, "no tienes permisos para ver este perfil");
  }

  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw new ApiError(404, "el usuario no existe");
  }

  res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const isSelf = req.user!._id.toString() === req.params.id;
  const isAdmin = req.user!.rol === "admin";

  if (!isSelf && !isAdmin) {
    throw new ApiError(403, "no tienes permisos para modificar este usuario");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "el usuario no existe");
  }

  const { nombre, apellido, fotoPerfil, rol } = req.body;

  if (nombre) user.nombre = nombre.trim();
  if (apellido) user.apellido = apellido.trim();
  if (fotoPerfil !== undefined) user.fotoPerfil = fotoPerfil;

  if (rol !== undefined) {
    if (!isAdmin) {
      throw new ApiError(403, "solo un administrador puede cambiar roles");
    }
    if (isSelf && rol !== "admin") {
      throw new ApiError(400, "no puedes degradar tu propia cuenta de administrador");
    }
    user.rol = rol;
  }

  await user.save();
  res.status(200).json({ success: true, data: user }); // el modelo de usuario ya tiene la propiedad password en select:false entonces no hay problema en entregar todo el objeto en la respuesta
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!._id.toString() === req.params.id) {
    throw new ApiError(400, "no puedes eliminar tu propia cuenta de administrador");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "el usuario no existe");
  }

  const organizedEvents = await Event.find({ organizador: user._id }).select("_id");
  const organizedEventIds = organizedEvents.map((event) => event._id);

  await Promise.all([
    Registration.deleteMany({ usuario: user._id }),
    Favorite.deleteMany({ usuario: user._id }),
    Notification.deleteMany({ usuario: user._id }),
    ...(organizedEventIds.length
      ? [
          Registration.deleteMany({ evento: { $in: organizedEventIds } }),
          Favorite.deleteMany({ evento: { $in: organizedEventIds } }),
          Notification.deleteMany({ evento: { $in: organizedEventIds } }),
          Event.deleteMany({ _id: { $in: organizedEventIds } })
        ]
      : [])
  ]);

  await User.findByIdAndDelete(user._id);

  res.status(200).json({ success: true, message: "usuario eliminado correctamente" });
});

export default { getUsers, getUser, updateUser, deleteUser };
