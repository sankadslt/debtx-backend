/* Purpose: This template is used for the DB connection.
Created Date: 2024-11-21
Created By: Janendra Chamodi (apjanendra@gmail.com)
Last Modified Date: 2024-12-26
Modified By: Janendra Chamodi (apjanendra@gmail.com)
             Naduni Rabel (rabelnaduni2000@gmail.com)
             Sasindu Srinayaka (sasindusrinayaka@gmail.com)
Version: 
Dependencies: mongoose, mariadb
Related Files: 
Notes:  */

// import { createConnection } from "mysql2";
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();

// export const mysqlConnection = createConnection({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
// });

// mysqlConnection.connect((err) => {
//   if (err) {
//     console.error("MySQL connection failed:", err.message);
//   } else {
//     console.log("MySQL connected");
//   }
// });

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
await connectMongoDB();

export default { connectMongoDB};

