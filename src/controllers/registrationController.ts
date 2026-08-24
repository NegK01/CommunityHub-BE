import { Request, Response } from "express";
import Registration from "../models/Registration";
import Event from "../models/Event";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const registerToEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const userId = req.user!._id;

  const event = await Event.findById(eventId).populate("participantes");
  if (!event) {
    throw new ApiError(404, "el evento no existe");
  }

  if (event.estado !== "activo") {
    throw new ApiError(400, "el evento no esta disponible para inscripciones");
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  if (event.fecha < today) {
    throw new ApiError(400, "no puedes inscribirte a un evento que ya paso");
  }

  if (event.organizador.toString() === userId.toString()) {
    throw new ApiError(400, "no puedes inscribirte a tu propio evento");
  }

  const existingRegistration = await Registration.findOne({
    usuario: userId,
    evento: eventId
  });

  if (existingRegistration && existingRegistration.estado === "activa") {
    throw new ApiError(400, "ya estas inscrito en este evento");
  }

  const activeCount = event.participantes ?? 0;
  if (activeCount >= event.capacidadMaxima) {
    throw new ApiError(400, "no quedan espacios disponibles para este evento");
  }

  if (existingRegistration && existingRegistration.estado === "cancelada") {
    existingRegistration.estado = "activa";
    existingRegistration.fechaInscripcion = new Date();
    await existingRegistration.save();
    res.status(200).json({ success: true, message: "inscripcion reactivada correctamente" });
    return;
  }

  const registration = await Registration.create({
    usuario: userId,
    evento: eventId,
    estado: "activa"
  });

  res.status(201).json({ success: true, data: registration });
});

export const cancelRegistration = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const userId = req.user!._id;

  const registration = await Registration.findOne({
    usuario: userId,
    evento: eventId,
    estado: "activa"
  });

  if (!registration) {
    throw new ApiError(404, "no tienes una inscripcion activa en este evento");
  }

  registration.estado = "cancelada";
  await registration.save();

  res.status(200).json({ success: true, message: "inscripcion cancelada correctamente" });
});

export const getMyRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const registrations = await Registration.find({
    usuario: req.user!._id,
    estado: "activa"
  })
    .populate({
      path: "evento",
      populate: [
        { path: "categoria", select: "nombre color" },
        { path: "organizador", select: "nombre apellido email" }
      ]
    })
    .sort({ fechaInscripcion: -1 });

  res.status(200).json({ success: true, data: registrations });
});

export default { registerToEvent, cancelRegistration, getMyRegistrations };
