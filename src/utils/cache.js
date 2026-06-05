const { client } = require("../redis");

const DEFAULT_TTL = 300;

const cache = {
  async get(key) {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, ttl = DEFAULT_TTL) {
    await client.setEx(key, ttl, JSON.stringify(value));
  },

  async del(...keys) {
    for (const key of keys) {
      await client.del(key);
    }
  },
};

module.exports = cache;
