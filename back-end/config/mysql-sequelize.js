const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  'railway',
  'root',
  'tqPeTCobVjBbdzifTWMhlxGmnRuwTTJe',
  {
    host: 'junction.proxy.rlwy.net',
    port: 44018,
    dialect: "mysql",
    timezone: "+00:00",
  }
);

module.exports = {
  sequelize,
  DataTypes,
  Sequelize,
};
