import { createClient } from "redis";
import ResponseError from "../responseError.js";
import logger from "../../config/logging.js";

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
  logger.error(err);
});

await redisClient.connect(); // ⬅️ Wajib connect dulu

await redisClient.select(process.env.REDIS_DB || 0); // ⬅️ Lalu baru pilih DB

export const get = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error("Cache get error:", error);

    throw new ResponseError(400, "Cache get error");
  }
};

export const remember = async (key, ttl, cb) => {
  try {
    const cached = await redisClient.get(key);
    if (cached !== null) {
      return JSON.parse(cached);
    }
    const data = await cb();
    await redisClient.set(key, JSON.stringify(data), {
      EX: ttl || 60 * 60, // default to 1 hour
    });

    return data;
  } catch (error) {
    logger.error(error);
    throw new ResponseError(400, "Cache remember error");
  }
};

export const set = async (key, value, ttl) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl || 60 * 60, // default to 1 hour
    });
    return true;
  } catch (error) {
    logger.error("Cache set error:", error);
    throw new ResponseError(400, "Cache set error");
  }
};

export const del = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error("Cache delete error:", error);
    throw new ResponseError(400, "Cache delete error");
  }
};
