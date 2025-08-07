import prisma from "../../config/prisma.js";

const meController = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Sukses Mendapat Data",
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
export default meController;
