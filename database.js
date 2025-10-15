const fs = require("fs");
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        ca: fs.readFileSync(__dirname + "/ca.pem"),
    },
});



pool.getConnection((err) => {
    if (err) console.error("Error connecting to the database", err);
    else console.log("Connected to the database");
});

module.exports = pool.promise();
