# CareerAI — Nền tảng Hướng nghiệp & Phát triển Sự nghiệp bằng AI

> Trợ lý AI đồng hành cùng sinh viên và người đi làm trong việc định hướng sự nghiệp, tối ưu hóa hồ sơ và lên kế hoạch học tập cá nhân hóa.

---

## 🌟 Giới thiệu tổng quan

**CareerAI** là ứng dụng web full-stack tích hợp Generative AI giúp người dùng:
- Phân tích CV thông minh và chấm điểm ATS
- Nhận đề xuất nghề nghiệp phù hợp từ AI
- Xây dựng lộ trình học tập cá nhân hóa
- Tự động tạo Portfolio chuyên nghiệp từ CV
- Trao đổi trực tiếp với AI về chiến lược sự nghiệp

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 🔐 **Xác thực người dùng** | Đăng ký/đăng nhập, xác thực OTP qua email, quên mật khẩu, bảo vệ route |
| 📄 **Phân tích CV AI** | Upload CV (PDF/DOCX), AI chấm điểm ATS, phân tích điểm mạnh/yếu, gợi ý cải thiện |
| 🎯 **Định hướng nghề nghiệp** | AI gợi ý 3 nghề phù hợp nhất, so sánh mức lương/kỹ năng/tiềm năng, chatbot tư vấn |
| 🗺️ **Lộ trình học tập** | Tạo roadmap tự động chi tiết theo tháng để đạt vị trí công việc mơ ước |
| 💼 **Portfolio Builder** | Bóc tách kỹ năng/dự án từ CV, xây dựng Portfolio trực tuyến, xuất PDF |
| 👤 **Quản lý hồ sơ** | Cập nhật thông tin cá nhân, đổi mật khẩu, upload avatar, quản lý phiên đăng nhập |
| ⚙️ **Cài đặt** | Tuỳ chỉnh giao diện (màu sắc, font, dark mode, compact mode) |

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| `react` | ^18 | UI framework chính |
| `react-dom` | ^18 | Render DOM |
| `react-router-dom` | ^6 | Client-side routing & bảo vệ route |
| `react-icons` | latest | Bộ icon đa dạng (FontAwesome, Feather...) |
| `lucide-react` | latest | Icon bổ sung phong cách hiện đại |
| `html2pdf.js` | latest | Xuất Portfolio sang file PDF |
| `@fortawesome/fontawesome-free` | latest | Bộ icon FontAwesome |
| `react-scripts` | ^5 | Build toolchain (Create React App) |

### Backend
| Thư viện | Mục đích |
|---|---|
| `flask` | Web server & API framework |
| `flask-cors` | Cấu hình CORS để kết nối với frontend |
| `pymysql` | Kết nối và thao tác với MySQL |
| `python-dotenv` | Quản lý biến môi trường qua file `.env` |
| `groq` | Gọi Groq API (model llama-3.3-70b-versatile) cho tính năng AI |
| `openai` | Tương thích OpenAI API (dự phòng) |
| `pdfplumber` | Đọc và trích xuất text từ file CV `.pdf` |
| `python-docx` | Đọc và trích xuất text từ file CV `.docx` |

### Database & Infrastructure
- **Database:** MySQL (chạy qua XAMPP hoặc MySQL Server)
- **AI Model:** Groq API — `llama-3.3-70b-versatile`
- **Email (OTP):** Gmail SMTP (port 465, SSL)

---

## 📁 Cấu trúc thư mục

```
career_ai/
├── backend/                     # Python/Flask API Server
│   ├── app.py                   # Entry point — khởi tạo Flask, đăng ký blueprint
│   ├── requirements.txt         # Danh sách thư viện Python
│   ├── .env                     # Biến môi trường (KHÔNG push lên git)
│   ├── .env.example             # Template biến môi trường cho team
│   ├── routes/                  # Các module API Blueprint
│   │   ├── auth_routes.py       # Đăng ký, đăng nhập, OTP, quên mật khẩu
│   │   ├── user_routes.py       # Hồ sơ, đổi mật khẩu, avatar, sessions
│   │   ├── cv_routes.py         # Upload CV, phân tích AI
│   │   ├── career_routes.py     # Gợi ý nghề nghiệp, chatbot hướng nghiệp
│   │   ├── roadmap_routes.py    # Tạo lộ trình học tập AI
│   │   ├── portfolio_routes.py  # Portfolio, kinh nghiệm, chứng chỉ, học vấn
│   │   ├── dashboard_routes.py  # Dữ liệu tổng quan dashboard
│   │   └── db_routes.py         # Tiện ích kiểm tra kết nối DB
│   ├── utils/
│   │   ├── ai.py                # Hàm gọi Groq/OpenAI API
│   │   ├── db.py                # Kết nối MySQL pool
│   │   └── email.py             # Gửi OTP qua Gmail SMTP
│   └── static/uploads/          # Thư mục chứa file CV & avatar user (không push lên git)
│
├── frontend/                    # ReactJS Application
│   ├── public/
│   │   ├── index.html
│   │   └── logo.png
│   ├── src/
│   │   ├── App.js               # Router chính, cấu hình route & PrivateRoute
│   │   ├── index.css            # CSS global
│   │   ├── services/
│   │   │   └── api.js           # Lớp gọi API trung tâm (BASE_URL, fetch wrappers)
│   │   ├── components/
│   │   │   ├── Auth/            # Login, Register (multi-step + OTP), ForgotPassword, PrivateRoute
│   │   │   ├── Landing/         # Trang chủ public (unlogged)
│   │   │   ├── DashboardLogged/ # Layout dashboard: Sidebar, Topbar, DashboardHome
│   │   │   └── Features/        # Các tính năng chính
│   │   │       ├── AiCvAnalysis.jsx
│   │   │       ├── CareerOrientation.jsx
│   │   │       ├── LearningPath.jsx
│   │   │       ├── PortfolioBuilder.jsx
│   │   │       ├── MyProfile.jsx
│   │   │       └── Settings.jsx
│   │   └── assets/              # Ảnh, logo
│   └── package.json
│
├── .gitignore                   # Ignore toàn project (node_modules, .venv, uploads, .env...)
└── README.md
```

---

## ⚙️ Cấu hình biến môi trường

Sau khi clone repo về, tạo file `.env` trong thư mục `backend/` từ template:

```bash
cp backend/.env.example backend/.env
```

Sau đó điền đầy đủ thông tin vào `backend/.env`:

```env
# Server
PORT=5000

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=career_ai

# Email SMTP (Gmail) — dùng để gửi OTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password   # Dùng App Password, không phải mật khẩu thường

# AI API Keys — chỉ cần ít nhất một trong các key sau
GROQ_API_KEY=your_groq_api_key      # Khuyến nghị — miễn phí tại console.groq.com
OPENAI_API_KEY=                     # Tùy chọn
GEMINI_API_KEY=                     # Tùy chọn
DEEPSEEK_API_KEY=                   # Tùy chọn
```

> **Lưu ý:** File `.env` chứa thông tin bảo mật — **KHÔNG bao giờ commit lên git**.

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### Yêu cầu hệ thống
- **Python** ≥ 3.9
- **Node.js** ≥ 16.x & npm ≥ 8.x
- **MySQL** ≥ 8.0 (hoặc XAMPP)

---

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd career_ai
```

---

### Bước 2: Thiết lập Database

1. Bật MySQL Server (XAMPP hoặc MySQL standalone)
2. Tạo database mới:
```sql
CREATE DATABASE career_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
3. Import file SQL schema (nếu có) hoặc để Flask tự tạo bảng khi chạy lần đầu

---

### Bước 3: Cài đặt Backend (Python/Flask)

```bash
cd backend

# Tạo virtual environment (khuyến nghị)
python -m venv .venv

# Kích hoạt venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt

# Cấu hình biến môi trường
cp .env.example .env
# Mở .env và điền thông tin DB + API keys

# Khởi chạy server
python app.py
```

✅ Backend sẽ chạy tại: `http://localhost:5000`

---

### Bước 4: Cài đặt Frontend (ReactJS)

Mở **terminal mới** (giữ backend đang chạy):

```bash
cd frontend

# Cài đặt toàn bộ dependencies
npm install

# Khởi chạy dev server
npm start
```

✅ Frontend sẽ tự mở tại: `http://localhost:3000`

---

### Tóm tắt nhanh (sau khi đã cài đặt lần đầu)

```bash
# Terminal 1 — Backend
cd backend && .venv\Scripts\activate && python app.py

# Terminal 2 — Frontend
cd frontend && npm start
```

---

## 🗺️ Các route Frontend

| Route | Component | Yêu cầu đăng nhập |
|---|---|---|
| `/` | Landing | ❌ |
| `/login` | Login | ❌ |
| `/register` | Register (3 bước) | ❌ |
| `/forgot-password` | ForgotPassword | ❌ |
| `/dashboard` | DashboardHome | ✅ |
| `/ai-cv` | AiCvAnalysis | ✅ |
| `/portfolio` | PortfolioBuilder | ✅ |
| `/career` | CareerOrientation | ✅ |
| `/learning-path` | LearningPath | ✅ |
| `/profile` | MyProfile | ✅ |
| `/settings` | Settings | ✅ |

---

## 📡 API Endpoints chính

Tất cả endpoint có tiền tố `/api`.

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/login` | Đăng nhập |
| `POST` | `/api/register/request-otp` | Gửi OTP đăng ký |
| `POST` | `/api/register/verify-otp` | Xác thực OTP & tạo tài khoản |
| `POST` | `/api/forgot-password/request-otp` | Gửi OTP quên mật khẩu |
| `POST` | `/api/forgot-password/reset` | Đặt lại mật khẩu |
| `GET` | `/api/user/:id` | Lấy thông tin user |
| `PUT` | `/api/user/:id` | Cập nhật hồ sơ |
| `PUT` | `/api/user/:id/password` | Đổi mật khẩu |
| `POST` | `/api/user/:id/avatar` | Upload avatar |
| `POST` | `/api/cv/upload` | Upload & phân tích CV bằng AI |
| `GET` | `/api/career/:id` | Lấy danh sách nghề nghiệp gợi ý |
| `POST` | `/api/career/generate` | AI tạo gợi ý nghề nghiệp mới |
| `POST` | `/api/career/chat` | Chat với AI hướng nghiệp |
| `GET` | `/api/roadmap/:id` | Lấy lộ trình học tập |
| `POST` | `/api/roadmap/generate` | AI tạo lộ trình học tập |
| `GET` | `/api/portfolio/:id` | Lấy dữ liệu Portfolio |

---

## 🌳 Chiến lược phân nhánh Git

```
main                          ← Nhánh chính, code đã ổn định
└── feature/auth              ← Xác thực người dùng
└── feature/baotoan           ← Tính năng cá nhân (đang phát triển)
└── feature/portfolio-builder ← Portfolio & CV Builder
└── feature/career            ← Định hướng nghề nghiệp
└── feature/learning-path     ← Lộ trình học tập
```

**Quy tắc:**
- Không commit trực tiếp lên `main`
- Tạo nhánh `feature/<tên>` cho từng tính năng
- Mở Pull Request để merge vào `main`

---

## ❗ Lưu ý quan trọng cho team

1. **KHÔNG commit file `.env`** — chứa API key và mật khẩu DB
2. **KHÔNG commit `node_modules/`** — chạy `npm install` sau khi pull
3. **KHÔNG commit `backend/static/uploads/`** — chứa CV/ảnh của user (dữ liệu nhạy cảm)
4. **KHÔNG commit `.venv/`** — chạy `pip install -r requirements.txt` sau khi pull
5. Mỗi khi pull code mới, kiểm tra xem có thay đổi `requirements.txt` hoặc `package.json` không rồi chạy lại lệnh install

---

## 📝 File `requirements.txt`

```
flask
flask-cors
pymysql
python-dotenv
groq
openai
pdfplumber
python-docx
```

> Nếu file `requirements.txt` chưa tồn tại, chạy: `pip freeze > requirements.txt` sau khi cài đặt thủ công.

---

*© 2026 CareerAI Platform — AI-Powered Career Development*
