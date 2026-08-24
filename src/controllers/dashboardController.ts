import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import Registration from "../models/Registration";
import Favorite from "../models/Favorite";
import Notification from "../models/Notification";
import Category from "../models/Category";
import asyncHandler from "../utils/asyncHandler";

const getUserDashboard = async (userId: any) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const [registrations, favoritesCount, unreadNotifications] = await Promise.all([
    Registration.find({ usuario: userId, estado: "activa" })
      .populate({
        path: "evento",
        populate: [
          { path: "categoria", select: "nombre color" },
          { path: "organizador", select: "nombre apellido email" }
        ]
      })
      .sort({ fechaInscripcion: -1 }),
    Favorite.countDocuments({ usuario: userId }),
    Notification.countDocuments({ usuario: userId, leida: false })
  ]);

  const proximasActividades = registrations.filter((r: any) => r.evento && new Date(r.evento.fecha) >= today);
  const historial = registrations.filter((r: any) => r.evento && new Date(r.evento.fecha) < today);

  return {
    rol: "user",
    resumen: {
      totalInscripciones: registrations.length,
      totalFavoritos: favoritesCount,
      notificacionesNoLeidas: unreadNotifications
    },
    proximasActividades,
    historial
  };
};

const getOrganizerDashboard = async (organizerId: any) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const events = await Event.find({ organizador: organizerId })
    .populate("categoria", "nombre color")
    .populate("participantes")
    .sort({ fecha: 1 });

  const totalParticipantes = events.reduce((sum, e) => sum + (e.participantes || 0), 0);
  const proximasActividades = events.filter((e) => e.estado === "activo" && new Date(e.fecha) >= today);

  return {
    rol: "organizer",
    resumen: {
      totalActividades: events.length,
      actividadesActivas: events.filter((e) => e.estado === "activo").length,
      actividadesCanceladas: events.filter((e) => e.estado === "cancelado").length,
      actividadesFinalizadas: events.filter((e) => e.estado === "finalizado").length,
      totalParticipantes
    },
    proximasActividades,
    misActividades: events
  };
};

const getAdminDashboard = async () => {
  const [
    totalUsuarios,
    totalOrganizadores,
    totalUsuariosComunes,
    totalActividades,
    actividadesActivas,
    actividadesCanceladas,
    actividadesFinalizadas,
    totalInscripciones,
    totalCategorias
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ rol: "organizer" }),
    User.countDocuments({ rol: "user" }),
    Event.countDocuments(),
    Event.countDocuments({ estado: "activo" }),
    Event.countDocuments({ estado: "cancelado" }),
    Event.countDocuments({ estado: "finalizado" }),
    Registration.countDocuments({ estado: "activa" }),
    Category.countDocuments()
  ]);

  return {
    rol: "admin",
    resumen: {
      usuarios: {
        total: totalUsuarios,
        organizadores: totalOrganizadores,
        usuariosComunes: totalUsuariosComunes
      },
      actividades: {
        total: totalActividades,
        activas: actividadesActivas,
        canceladas: actividadesCanceladas,
        finalizadas: actividadesFinalizadas
      },
      inscripcionesTotales: totalInscripciones,
      totalCategorias
    }
  };
};

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const rol = req.user!.rol;
  let data;

  if (rol === "user") {
    data = await getUserDashboard(req.user!._id);
  } else if (rol === "organizer") {
    data = await getOrganizerDashboard(req.user!._id);
  } else if (rol === "admin") {
    data = await getAdminDashboard();
  }

  res.status(200).json({ success: true, data });
});

export default { getDashboard };
