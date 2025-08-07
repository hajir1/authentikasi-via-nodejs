import argon2 from "argon2";
import prisma from "../../config/prisma.js";
import ResponseError from "../../libs/responseError.js";
import mainValidate from "../../validators/main.validate.js";
import registerValidate from "../../validators/register.validate.js";

const registerUserController = async (req, res, next) => {
  try {
    const validate = mainValidate(registerValidate, req.body);

    const foundUser = await prisma.users.findFirst({
      where: {
        email: validate.email,
      },
    });
    if (foundUser) {
      throw new ResponseError(400, "Email Telah Digunakan");
    }
    if (validate.password !== validate.verify_password) {
      throw new ResponseError(400, "Password Tidak Cocok");
    }
    const hashPassword = await argon2.hash(validate.password, 10);

    const data = await prisma.users.create({
      data: {
        username: validate.username,
        email: validate.email,
        password: hashPassword,
      },
      select: {
        username: true,
        email: true,
        role: true,
      },
    });
    return res.status(200).json({ message: data });
  } catch (error) {
    next(error);
  }
};

export default registerUserController;
