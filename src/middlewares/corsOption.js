import ResponseError from "../libs/responseError.js";

const allowedOrigins = [
  `${process.env.SITE_URL}`,
  "https://localhost:5173",
  "https://localhost:3000",
  "https://localhost:8001",
  "https://192.168.0.100",
];

export const corsOption = {
  origin: (origin, callback) => {
    if (!allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      throw new ResponseError(403, "Not Allowed By Cors");
    }
  },
};
