// src/utils/logger.js (atau bebas penamaannya)

import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize } = format;

// Format custom untuk log output
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Buat logger instance
const logger = createLogger({
  level: "info", // default level
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(), // untuk warna di console
    logFormat
  ),
  transports: [
    // Console log
    new transports.Console(),

    // Simpan log level warn dan error ke file terpisah
    new transports.File({ filename: "logs/warn.log", level: "warn" }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/info.log", level: "info" }),
  ],
});

export default logger;
