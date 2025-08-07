import logger from "../../config/logging.js";
import prisma from "../../config/prisma.js";
import jwt, { decode } from "jsonwebtoken";
const logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const oldToken = cookies?.jwt;
    let decoded = null;

    try {
      decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN);
    } catch (error) {
      decoded = null; //token invalid
      logger.log("Invalid refresh token");
    }
    // ambil refresh token dari cookie

    // bandingkan cookie dengan token yang ada di db
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

    // jika saat logout mengirim refresh token , tapi token tidak ada di db , hapus seluruh token dengan user yang baru saja login (indikasi token di hack/bocor)
    if (!existingToken) {
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

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default logout;
