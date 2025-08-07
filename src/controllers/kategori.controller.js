import prisma from "../config/prisma.js";
import Paginator from "../libs/paginator.js";
import {
  delCache,
  getCache,
  rememberCache,
  setCache,
} from "../libs/cache/index.js";

const index = async (req, res, next) => {
  try {
    const data = await rememberCache("kategoris", 60 * 60 * 24, async () => {
      return await prisma.kategoris.findMany({
        orderBy: {
          created_at: "desc",
        },
      });
    });
    return res.status(200).json({ message: "Sukses Mendapat Data", data });
  } catch (error) {
    next(error);
  }
};

const seeding = async (req, res, next) => {
  try {
    const data = await prisma.kategoris.createMany({
      data: [
        {
          nama: "politik",
        },
        {
          nama: "olahraga",
        },
        {
          nama: "bisnis",
        },
        {
          nama: "fisika",
        },
        {
          nama: "matematika",
        },
        {
          nama: "ai",
        },
        {
          nama: "agama",
        },
        {
          nama: "prestasi",
        },
        {
          nama: "shari hari",
        },
        {
          nama: "dongeng",
        },
      ],
      skipDuplicates: true,
    });
    await delCache("kategoris");
    await setCache("kategoris", data, 60 * 60); // cache for 1 hour
    // sample paginator
    res.status(200).json({ message: "Sukses Menambah Data", data });
  } catch (error) {
    next(error);
  }
};

export { index, seeding };
