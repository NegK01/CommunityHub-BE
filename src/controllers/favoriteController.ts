import { Request, Response } from "express";
import Favorite from "../models/Favorite";
import Event from "../models/Event";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const addFavorite = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const userId = req.user!._id;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "el evento no existe");
  }

  const existing = await Favorite.findOne({ usuario: userId, evento: eventId });
  if (existing) {
    throw new ApiError(400, "el evento ya esta en tus favoritos");
  }

  const favorite = await Favorite.create({ usuario: userId, evento: eventId });
  res.status(201).json({ success: true, data: favorite });
});

export const removeFavorite = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const userId = req.user!._id;

  const favorite = await Favorite.findOneAndDelete({ usuario: userId, evento: eventId });
  
  if (!favorite) {
    throw new ApiError(404, "el evento no esta en tus favoritos");
  }

  res.status(200).json({ success: true, message: "evento eliminado de favoritos" });
});

export const getMyFavorites = asyncHandler(async (req: Request, res: Response) => {
  const favorites = await Favorite.find({ usuario: req.user!._id })
    .populate({
      path: "evento",
      populate: [
        { path: "categoria", select: "nombre color" },
        { path: "organizador", select: "nombre apellido email" }
      ]
    })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: favorites });
});

export default { addFavorite, removeFavorite, getMyFavorites };
