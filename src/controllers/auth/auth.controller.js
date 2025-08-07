import argon2 from "argon2";
import jwt from "jsonwebtoken";
import authValidate from "../../validators/auth.validate.js";
import mainValidate from "../../validators/main.validate.js";
import prisma from "../../config/prisma.js";
import ResponseError from "../../libs/responseError.js";
import logger from "../../config/logging.js";
const authenticateUserController = async (req, res, next) => {
  const cookies = req.cookies;
  logger.info(`old Cookie ${JSON.stringify(cookies?.jwt)}`);

  let decoded;
  // ambil refresh token lama
  const oldToken = cookies.jwt;
  try {
    decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN);
  } catch (err) {
    decoded = null;
    logger.info("Invalid refresh token");
  }

  try {
    // validasi input
    const validate = mainValidate(authValidate, req.body);

    // cari user
    const foundUser = await prisma.users.findFirst({
      where: {
        email: validate.email,
      },
    });
    if (!foundUser) {
      throw new ResponseError(400, "Email Dan Password Tidak Cocok");
    }
    // bandingkan pw
    const comparePwd = await argon2.verify(
      foundUser.password,
      validate.password
    );
    if (!comparePwd) {
      throw new ResponseError(400, "Email Dan Password Tidak Cocok");
    }

    // buat token baru
    const newRefreshToken = jwt.sign(
      { id: foundUser.id },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    const accessToken = jwt.sign(
      {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "15m",
      }
    );
    // jika di cookie ada refresh_token , jalankan di bawah ini
    if (oldToken) {
      const existingToken = await prisma.users.findFirst({
        where: {
          refresh_token: {
            some: {
              token: oldToken,
            },
          },
        },
        include: {
          refresh_token: true,
        },
      });
      // jika saat login mengirim refreh token , tapi token tidak ada di db , hapus seluruh token dengan user yang baru saja login (indikasi token di hack/bocor)
      if (!existingToken) {
        logger.warn(`reuse token ${decoded?.id}`);

        await prisma.refresh_tokens.deleteMany({
          where: {
            userId: decoded?.id,
          },
        });
      } else {
        // jika token cocok dengan db , hapus token lama di db
        await prisma.refresh_tokens.deleteMany({
          where: {
            token: oldToken,
          },
        });
      }
      // hapus juga di cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.MODE === "production",
      });
    }

    // buat token baru
    await prisma.refresh_tokens.create({
      data: {
        token: newRefreshToken,
        userId: foundUser.id,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      },
    });
    return res
      .cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.MODE === "production",
      })
      .status(200)
      .json({
        accessToken,
        expiresIn: 15 * 60 + "detik",
      });
  } catch (error) {
    next(error);
  }
};

export default authenticateUserController;
