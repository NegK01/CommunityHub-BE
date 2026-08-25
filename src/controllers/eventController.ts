import { Request, Response } from "express";
import Event from "../models/Event";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, location, date, upcoming, available, organizer, all, status } = req.query;
  const filter: any = {};

  if (all !== "true") {
    filter.estado = status ? String(status) : "activo";
  }

  if (search) {
    const searchRegex = new RegExp(String(search).trim(), "i");
    filter.$or = [{ titulo: searchRegex }, { descripcion: searchRegex }];
  }

  if (category) filter.categoria = category;
  if (organizer) filter.organizador = organizer;
  if (location) filter.ubicacion = new RegExp(String(location).trim(), "i");

  if (date) {
    const [year, month, day] = String(date).split("T")[0].split("-").map(Number);
    if (year && month && day) {
      filter.fecha = {
        $gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
        $lte: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
      };
    }
  } else if (upcoming === "true") {
    filter.fecha = { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) };
  }

  let events = await Event.find(filter)
    .populate("categoria", "nombre color")
    .populate("organizador", "nombre apellido email")
    .populate("participantes")
    .sort({ fecha: 1 });

  if (available === "true") {
    events = events.filter((e) => (e.espaciosDisponibles ?? 0) > 0);
  }

  res.status(200).json({ success: true, data: events });
});

export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate("categoria")
    .populate("organizador", "nombre apellido email fotoPerfil")
    .populate("participantes");

  if (!event) {
    throw new ApiError(404, "el evento no existe");
  }

  res.status(200).json({ success: true, data: event });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.create({
    ...req.body,
    organizador: req.user!._id
  });

  const created = await Event.findById(event._id)
    .populate("categoria", "nombre color")
    .populate("organizador", "nombre apellido email");

  res.status(201).json({ success: true, data: created });
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "el evento no existe");
  }

  const isOwner = event.organizador.toString() === req.user!._id.toString();
  const isAdmin = req.user!.rol === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "no tienes permisos para editar este evento");
  }

  Object.assign(event, req.body);
  await event.save();

  const updated = await Event.findById(event._id)
    .populate("categoria", "nombre color")
    .populate("organizador", "nombre apellido email");

  res.status(200).json({ success: true, data: updated });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "el evento no existe");
  }

  const isOwner = event.organizador.toString() === req.user!._id.toString();
  const isAdmin = req.user!.rol === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "no tienes permisos para eliminar este evento");
  }

  event.estado = "cancelado";
  await event.save();

  res.status(200).json({ success: true, message: "evento cancelado correctamente" });
});

export default { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
