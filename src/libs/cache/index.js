import * as redisDriver from "./redisDriver.js";

let driver;

switch (process.env.CACHE_DRIVER) {
  case "redis":
    driver = redisDriver;
  default:
    break;
}

let getCache = driver.get;
let setCache = driver.set;
let delCache = driver.del;
let rememberCache = driver.remember;

export { delCache, getCache, setCache,rememberCache };
