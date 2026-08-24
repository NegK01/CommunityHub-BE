import { Request, Response } from "express";
import Category from "../models/Category";
import Event from "../models/Event";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.all === "true" ? {} : { activa: true };
  const categories = await Category.find(filter).sort({ nombre: 1 });
  res.status(200).json({ success: true, data: categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "la categoria no existe");
  }
  res.status(200).json({ success: true, data: category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, descripcion, color } = req.body;
  if (!nombre) {
    throw new ApiError(400, "el nombre es requerido");
  }

  const existing = await Category.findOne({ nombre: nombre.trim() });
  if (existing) {
    throw new ApiError(409, "ya existe una categoria con ese nombre");
  }

  const category = await Category.create({ nombre: nombre.trim(), descripcion, color });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) {
    throw new ApiError(404, "la categoria no existe");
  }
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "la categoria no existe");
  }

  const eventsCount = await Event.countDocuments({ categoria: req.params.id });
  if (eventsCount > 0) {
    throw new ApiError(400, "no se puede desactivar la categoria porque tiene eventos asociados");
  }

  category.activa = false;
  await category.save();

  res.status(200).json({
    success: true,
    message: "categoria desactivada correctamente"
  });
});

export default { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
