const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_HOST || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis error:", err));
client.on("connect", () => console.log("Redis connected"));

const connectRedis = async () => {
  await client.connect();
};

module.exports = { client, connectRedis };
