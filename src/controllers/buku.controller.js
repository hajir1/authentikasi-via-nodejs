import { faker } from "@faker-js/faker";
import prisma from "../config/prisma.js";
import Paginator from "../libs/paginator.js";
import ResponseError from "../libs/responseError.js";

const index = async (req, res, next) => {
  try {
    const paginator = new Paginator(
      prisma.bukus,
      req.query,
      { orderBy: { created_at: "desc" } },
      ["nama", "penulis"]
    );
    const data = await paginator.paginate(10);
    return res.status(200).json({ message: "Sukses Mendapat Data", data });
  } catch (error) {
    next(error);
  }
};
export const pinjam = async (req, res, next) => {
  try {
    const buku = await prisma.bukus.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (!buku) {
      throw new ResponseError(400, "Buku Tidak Ditemukan");
    }
    if (buku.stok < req.body.qty) {
      throw new ResponseError(400, "Stok Buku Tidak Cukup");
    }
    await prisma.$transaction(async (tx) => {
      // hindari race condition dengan optimistic locking
      const version = buku.version;
      const updatedResult = await tx.bukus.updateMany({
        where: {
          id: parseInt(req.params.id),
          version: version,
        },
        data: {
          version: version + 1,
          stok: buku.stok - req.body.qty,
        },
      });
      if (updatedResult.count === 0) {
        throw new ResponseError(
          400,
          "gagal meminjam buku, coba ulangi beberapa detik lagi"
        );
      }
    });
    res.status(200).json({ message: "sukses meminjam buku" });
  } catch (error) {
    next(error);
  }
};

const seeding = async (req, res, next) => {
  try {
    for (let index = 0; index < 50; index++) {
      await prisma.bukus.create({
        data: {
          nama: faker.lorem.words({ min: 2, max: 5 }),
          penulis: faker.person.fullName(),
          kategoriId: faker.number.int({ min: 1, max: 10 }),
          stok: faker.number.int({ min: 10, max: 50 }),
        },
        include: {
          kategori: true,
        },
      });
    }
    // sample paginator
    res.status(200).json({ message: "Sukses Menambah 50 Data Buku" });
  } catch (error) {
    next(error);
  }
};

export { index, seeding };
