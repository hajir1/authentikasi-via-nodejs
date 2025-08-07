import express from "express";
import { index, seeding } from "../controllers/kategori.controller.js";

const kategoriRouter = express.Router();

kategoriRouter.get("/index", index);
kategoriRouter.get("/seed", seeding);

export default kategoriRouter;
