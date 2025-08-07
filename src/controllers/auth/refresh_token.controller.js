import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
const handleRefreshToken = async (req, res, next) => {
  const cookies = req.cookies;
  logger.log(`old Cookie ${JSON.stringify(cookies?.jwt)}`);
  if (!cookies?.jwt) return res.sendStatus(401);

  const oldToken = cookies?.jwt;
  let decoded = null;

  try {
    decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN);
  } catch (err) {
    decoded = null;
    logger.log("Invalid refresh token");
  }

  try {
    // jika di cookie ada refresh_token , jalankan di bawah ini
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
    // jika saat get /refresh mengirim refresh token , tapi token tidak ada di db , hapus seluruh token dengan user yang baru saja login (indikasi token di hack/bocor)
    if (!existingToken) {
      await prisma.refresh_tokens.deleteMany({
        where: {
          userId: decoded?.id,
        },
      });
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.MODE === "production",
      });
      return res.sendStatus(403); // keluar dari flow
    } else {
      // jika token cocok dengan db , hapus token lama di db
      await prisma.refresh_tokens.delete({
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

    // cari user dengan id yang sama dengan cookie
    const foundUser = await prisma.users.findFirst({
      where: {
        id: decoded?.id,
      },
    });
    // handle jika user tidak ada
    if (!foundUser) return res.sendStatus(403);

    // generate token baru
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
        username: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "15m",
      }
    );
    // simpan di db
    await prisma.refresh_tokens.create({
      data: {
        token: newRefreshToken,
        userId: foundUser.id,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
       
      },
    });
    // simpan di cookie
    return res
      .cookie("jwt", newRefreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
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

export default handleRefreshToken;
