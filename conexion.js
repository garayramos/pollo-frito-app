const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'yamanote.proxy.rlwy.net',   // Host proxy público que usas en Workbench
  user: 'root',
  password: 'SatgBkTsKiZdDKsNljZtLzgYPRSCqjYi',
  database: 'railway',
  port: 43959,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
