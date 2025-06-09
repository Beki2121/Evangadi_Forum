const mysql2 = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const dbConnection = mysql2.createPool({
  user: process.env.DB_USER,
  database: process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  connectionLimit: process.env.CONNECTION_LIMIT,
  host: process.env.DB_HOST,
});
// Test the database connection
dbConnection.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  } else {
    console.log("Database connected successfully.");
    connection.release(); // Release the connection back to the pool
  }
});
module.exports = dbConnection.promise();
