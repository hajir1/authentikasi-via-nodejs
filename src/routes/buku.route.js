import express from "express";
import { index, pinjam, seeding } from "../controllers/buku.controller.js";

const bukuRouter = express.Router();

bukuRouter.get("/index", index);
bukuRouter.put("/pinjam/:id", pinjam);
bukuRouter.get("/seed", seeding);

export default bukuRouter;
