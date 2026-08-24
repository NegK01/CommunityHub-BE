import { Request, Response } from "express";
import Notification from "../models/Notification";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ usuario: req.user!._id })
    .populate("evento", "titulo fecha hora ubicacion")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: notifications });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, usuario: req.user!._id },
    { leida: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "la notificacion no existe");
  }

  res.status(200).json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { usuario: req.user!._id, leida: false },
    { leida: true }
  );

  res.status(200).json({
    success: true,
    message: "todas las notificaciones fueron marcadas como leidas"
  });
});

export default { getMyNotifications, markAsRead, markAllAsRead };
