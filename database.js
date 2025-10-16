const fs = require("fs");
const mysql = require("mysql2");
const path = require("path");

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

if (process.env.NODE_ENV === "production") {
    dbConfig.ssl = {
        ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
        rejectUnauthorized: true,
    };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool.promise();

// const fs = require("fs");
// const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     ssl: {
//         rejectUnauthorized: false,
//     },
// });

// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error("Error connecting to the database", err);
//         return;
//     }
//     console.log("Connected to the database");
//     connection.release();
// });

// module.exports = pool.promise();
