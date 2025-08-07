import express from "express";
import kategoriRouter from "./kategori.route.js";
import bukuRouter from "./buku.route.js";

const router = express.Router();
const routes = [
  {
    path: "/api/kategori",
    route: kategoriRouter,
  },
  {
    path: "/api/buku",
    route: bukuRouter,
  },
];

routes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
