var mysql = require("mysql");
var mysql_pool = mysql.createPool({
  connectionLimit: 10,
  host: 'junction.proxy.rlwy.net',
  user: 'root',
  password: 'tqPeTCobVjBbdzifTWMhlxGmnRuwTTJe',
  database: 'railway',
  port: 44018,
});

module.exports = {
  mysql_pool: mysql_pool,
};
