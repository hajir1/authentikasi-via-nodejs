import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";
import router from "./src/routes/main.route.js";
import registerUserController from "./src/controllers/auth/registerUser.controller.js";
import authenticateUserController from "./src/controllers/auth/auth.controller.js";
import authVerify from "./src/middlewares/authVerify.js";
import meController from "./src/controllers/auth/me.controller..js";
import handleRefreshToken from "./src/controllers/auth/refresh_token.controller.js";
import { corsOption } from "./src/middlewares/corsOption.js";
import logger from "./src/config/logging.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors(corsOption)
);

app.post("/api/auth/register", registerUserController);
app.post("/api/auth/login", authenticateUserController);
app.get("/api/auth/refresh", handleRefreshToken);

app.use(authVerify);

app.get("/api/me", meController);
app.use(router);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  logger.info(`server running in port ${process.env.PORT}`);
  console.log(`server running in port ${process.env.PORT}`);
});

export default app;
