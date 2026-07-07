import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối ban đầu
pool.getConnection()
  .then(connection => {
    console.log('--- Kết nối MySQL thành công! ---');
    connection.release();
  })
  .catch(err => {
    console.error('--- Lỗi kết nối MySQL: ---', err.message);
  });

export default pool;
