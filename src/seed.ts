import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User";
import Category from "./models/Category";
import Event from "./models/Event";
import Registration from "./models/Registration";
import Favorite from "./models/Favorite";
import Notification from "./models/Notification";

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("falta la variable de entorno mongodb_uri");
    }

    console.log("conectando a mongodb para ejecutar el seeder...");
    await mongoose.connect(mongoUri);

    console.log("limpiando colecciones existentes...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Favorite.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log("creando usuarios de prueba...");
    const [admin, organizer, user] = await Promise.all([
      User.create({
        nombre: "Admin",
        apellido: "CommunityHub",
        email: "admin@communityhub.com",
        password: "password123",
        rol: "admin"
      }),
      User.create({
        nombre: "Carlos",
        apellido: "Organizador",
        email: "organizer@communityhub.com",
        password: "password123",
        rol: "organizer"
      }),
      User.create({
        nombre: "Enoc",
        apellido: "Usuario",
        email: "user@communityhub.com",
        password: "password123",
        rol: "user"
      })
    ]);

    console.log("creando categorias...");
    const [tech, sports, art, edu] = await Promise.all([
      Category.create({
        nombre: "Tecnologia",
        descripcion: "Talleres de programacion, hackathones y charlas tech",
        color: "#3B82F6"
      }),
      Category.create({
        nombre: "Deportes",
        descripcion: "Torneos, carreras y actividades fisicas comunitarias",
        color: "#10B981"
      }),
      Category.create({
        nombre: "Arte y Cultura",
        descripcion: "Exposiciones, teatro, conciertos y talleres creativos",
        color: "#8B5CF6"
      }),
      Category.create({
        nombre: "Educacion",
        descripcion: "Cursos, idiomas y capacitaciones comunitarias",
        color: "#F59E0B"
      })
    ]);

    console.log("Creando actividades pipas...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    const [event1, event2, event3] = await Promise.all([
      Event.create({
        titulo: "Workshop de web",
        descripcion: "Aprende a construir aplicaciones web",
        categoria: tech._id,
        fecha: tomorrow,
        hora: "18:00",
        ubicacion: "Auditorio 301",
        capacidadMaxima: 30,
        organizador: organizer._id,
        estado: "activo"
      }),
      Event.create({
        titulo: "Torneo de futbol",
        descripcion: "Torneo de futbol 7 para la comunidad",
        categoria: sports._id,
        fecha: inThreeDays,
        hora: "09:00",
        ubicacion: "Cancha 101",
        capacidadMaxima: 20,
        organizador: organizer._id,
        estado: "activo"
      }),
      Event.create({
        titulo: "Charla de software libre",
        descripcion: "Exploracion de herramientas open source, licencias y desarrollo colaborativo",
        categoria: edu._id,
        fecha: inSevenDays,
        hora: "17:00",
        ubicacion: "Auditorio 305",
        capacidadMaxima: 50,
        organizador: organizer._id,
        estado: "activo"
      })
    ]);

    console.log("creando inscripcion y favorito de prueba...");
    await Registration.create({
      usuario: user._id,
      evento: event1._id,
      estado: "activa"
    });

    await Favorite.create({
      usuario: user._id,
      evento: event1._id
    });

    console.log("creando notificacion de bienvenida...");
    await Notification.create({
      usuario: user._id,
      evento: event1._id,
      tipo: "sistema",
      titulo: "Bienvenido a CommunityHub",
      mensaje: "Te has registrado exitosamente en la plataforma. Explora las actividades disponibles.",
      leida: false
    });

    console.log("-----------------------------------------");
    console.log("seeder ejecutado con exito");
    console.log("usuarios demo creados (misma password para todos: password123):");
    console.log("1. Admin:       admin@communityhub.com");
    console.log("2. Organizer:   organizer@communityhub.com");
    console.log("3. User:        user@communityhub.com");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("error ejecutando el seeder:", error.message || error);
    process.exit(1);
  }
};

seedDatabase();
