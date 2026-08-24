import { Router } from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getMyRegistrations,
  getMyFavorites
} from "../controllers/userController";
import { protect } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(protect);

// Rutas de perfil del usuario conectado
router.get("/me/registrations", getMyRegistrations);
router.get("/me/favorites", getMyFavorites);

// Rutas de administracion y usuarios
router.get("/", authorize("admin"), getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
