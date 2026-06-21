import { createClient } from "redis";

export const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

export const redisConnect = async () => {
  client.on("connect", () =>
    console.log("Successfully connecting to Redis Cloud..."),
  );
  client.on("ready", () => console.log("Redis Cloud client is ready to use!"));
  client.on("error", (err) => console.error("Redis Connection Error:", err));

  await client.connect();
};
