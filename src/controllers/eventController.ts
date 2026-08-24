import { Request, Response } from "express";
import Event from "../models/Event";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, location, date, upcoming, available, organizer } = req.query;
  const filter: any = { estado: "activo" };

  if (search) {
    const searchRegex = new RegExp(String(search).trim(), "i"); // hacer busquedas parciales y i para case-insensitive
    filter.$or = [{ titulo: searchRegex }, { descripcion: searchRegex }]; // buscar el texto si aparace en el titulo o si aparece en la descripcion 
  }

  if (category) filter.categoria = category;
  if (organizer) filter.organizador = organizer;
  if (location) filter.ubicacion = new RegExp(String(location).trim(), "i");

  if (date) {
    const start = new Date(String(date));
    start.setHours(0, 0, 0, 0);
    const end = new Date(String(date)); 
    end.setHours(23, 59, 59, 999);
    filter.fecha = { $gte: start, $lte: end }; // filtramos que sea mayor o igual que la fecha de inicio y menor o igual que la fecha final
  } else if (upcoming === "true") {
    filter.fecha = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
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
