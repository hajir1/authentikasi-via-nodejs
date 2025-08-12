import { ZodError } from "zod";
import ResponseError from "../libs/responseError.js";
import logger from "../config/logging.js";

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ResponseError) {
    logger.error(err.message);
    return res.status(err.stts).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    const formatted = err.issues.map((e) => ({
      message: e.message,
      path: e.path.join("."),
    }));
    logger.error(err.message);
    return res.status(400).json({ message: formatted });
  }

  return res.status(500).json({ message: "Internal Server Error" });
};

export default errorMiddleware;
