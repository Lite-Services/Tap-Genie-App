var mysql = require("mysql");
var mysql_pool = mysql.createPool({
  connectionLimit: 10,
  host: 'roundhouse.proxy.rlwy.net:56699',
  user: 'root',
  password: 'OUqxqvORWkLBFQJQvhAUuKlcIGuJsqfa',
  database: 'railway',
});

module.exports = {
  mysql_pool: mysql_pool,
};
