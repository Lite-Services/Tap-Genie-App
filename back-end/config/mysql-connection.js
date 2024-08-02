var mysql = require("mysql");
var mysql_pool = mysql.createPool({
  connectionLimit: 10,
  host: 'roundhouse.proxy.rlwy.net',
  user: 'root',
  password: 'OUqxqvORWkLBFQJQvhAUuKlcIGuJsqfa',
  database: 'railway',
  port: 56699,
});

module.exports = {
  mysql_pool: mysql_pool,
};
