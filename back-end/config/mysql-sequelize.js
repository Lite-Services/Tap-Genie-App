const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  'railway',
  'root',
  'OUqxqvORWkLBFQJQvhAUuKlcIGuJsqfa',
  {
    host: 'mysql://root:OUqxqvORWkLBFQJQvhAUuKlcIGuJsqfa@roundhouse.proxy.rlwy.net:56699/railway',
    dialect: "mysql",
    timezone: "+00:00",
  }
);

module.exports = {
  sequelize,
  DataTypes,
  Sequelize,
};
