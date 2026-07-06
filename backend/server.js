import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API test kết nối và truy vấn dữ liệu từ bảng user
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, email, role, status FROM user LIMIT 5');
    res.json({
      success: true,
      message: 'Truy vấn cơ sở dữ liệu thành công!',
      data: rows
    });
  } catch (error) {
    console.error('Lỗi khi truy vấn database:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi truy vấn cơ sở dữ liệu!',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('CareerAI Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
