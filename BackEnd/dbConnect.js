const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_CONNECTION_USER,
  process.env.DB_CONNECTION_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
    dialectOptions: {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    },
  }
);

module.exports = sequelize;
