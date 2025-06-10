// 🧠 config.js
require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  baseUrl: process.env.BASE_URL || "http://localhost:5000",
  // For serving images and links
};

module.exports = config;
