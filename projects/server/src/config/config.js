const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mysql2 = require("mysql2");

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectModule: mysql2,
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectModule: mysql2,
  },
};
