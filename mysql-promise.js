const mysql = require('mysql2/promise');

const mysqlPromise = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'monad',
    password: '9A?*&?nYPs',
    database: 'Bamazon'
  });
  
  module.exports = mysqlPromise;