const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  'railway',
  'root',
  'OUqxqvORWkLBFQJQvhAUuKlcIGuJsqfa',
  {
    host: 'roundhouse.proxy.rlwy.net',
    port: 56699,
    dialect: "mysql",
    timezone: "+00:00",
  }
);

module.exports = {
  sequelize,
  DataTypes,
  Sequelize,
};
