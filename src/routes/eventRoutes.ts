import { Router } from "express";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController";
import { registerToEvent, cancelRegistration } from "../controllers/registrationController";
import { addFavorite, removeFavorite } from "../controllers/favoriteController";
import { protect } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

const router = Router();

// Consultas publicas
router.get("/", getEvents);
router.get("/:id", getEvent);

// Gestion de eventos (solo organizador y admin)
router.post("/", protect, authorize("organizer", "admin"), createEvent);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);

// Inscripciones a eventos
router.post("/:id/register", protect, registerToEvent);
router.delete("/:id/register", protect, cancelRegistration);

// Favoritos de eventos
router.post("/:id/favorite", protect, addFavorite);
router.delete("/:id/favorite", protect, removeFavorite);

export default router;
