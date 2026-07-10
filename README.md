# CareerAI - Trợ lý Ảo Hướng nghiệp & Tuyển dụng AI

## 🌟 Giới thiệu tổng quan
**CareerAI** là một nền tảng hỗ trợ sinh viên và người đi làm trong việc định hướng sự nghiệp, tối ưu hóa hồ sơ và lên kế hoạch học tập cá nhân hóa thông qua sức mạnh của Trí tuệ Nhân tạo (Generative AI). Thay vì những lời khuyên chung chung, CareerAI sẽ đọc và thấu hiểu hồ sơ thực tế của bạn để đưa ra những phân tích sâu sắc nhất.

Các tính năng nổi bật:
- **Phân tích CV (AI CV Analysis):** Tự động đọc file CV (PDF/Docx), đánh giá "Điểm ATS" và phân tích chi tiết điểm mạnh/điểm yếu của ứng viên so với thị trường.
- **Định hướng Nghề nghiệp (Career Orientation):** AI đề xuất 3 nghề nghiệp phù hợp nhất dựa trên kỹ năng của người dùng. Cho phép so sánh chi tiết giữa các ngành nghề (mức lương, kỹ năng cần thiết, đánh giá AI).
- **Lộ trình học tập (Learning Path):** Tạo lộ trình học tập tự động chi tiết theo từng tháng để đạt được vị trí công việc mơ ước.
- **Xây dựng Portfolio (Portfolio Builder):** Tự động bóc tách kỹ năng, dự án từ CV để khởi tạo nhanh một Portfolio chuyên nghiệp. Cung cấp tính năng tải về định dạng PDF vô cùng tiện lợi.
- **Quản lý tài khoản (Auth & Dashboard):** Hệ thống đăng nhập/đăng ký với đầy đủ tính năng cập nhật thông tin cá nhân.

---

## 🛠️ Công nghệ sử dụng
- **Frontend:** ReactJS, CSS3 (Vanilla), React Router DOM, Lucide React, HTML2PDF.
- **Backend:** Python (Flask), PyMySQL.
- **Database:** MySQL.
- **AI Integration:** Groq API (sử dụng model Llama 3) / OpenAI API (nếu cần).

---

## 📦 Yêu cầu & Các thư viện cần cài đặt (Dependencies)

Để chạy được dự án này, bạn cần cài đặt Node.js (dành cho Frontend và NodeJS Backend tùy chọn) và Python 3 (dành cho Python Backend), cùng với hệ quản trị CSDL MySQL.

### 1. Cài đặt Backend

Dự án có hai phiên bản Backend (Python và Node.js). Phiên bản chính đang được sử dụng là Python.

**Cách 1: Python / Flask (Đang dùng chính)**
Di chuyển vào thư mục `backend` và chạy lệnh cài đặt trực tiếp các thư viện thông qua `pip`:

```bash
cd backend
pip install flask
pip install flask-cors
pip install pymysql
pip install python-dotenv
pip install groq
pip install openai
pip install pdfplumber
pip install python-docx
```

*Phân tích các thư viện Python:*
- `flask`, `flask-cors`: Xây dựng web server và cấu hình CORS để kết nối với frontend.
- `pymysql`: Kết nối và thao tác với Database MySQL.
- `python-dotenv`: Quản lý các biến môi trường (environment variables) qua file `.env`.
- `groq`, `openai`: Sử dụng thư viện OpenAI client để giao tiếp với API của Groq (chạy model Llama 3) cho các tính năng phân tích CV và hướng nghiệp.
- `pdfplumber`, `python-docx`: Đọc và trích xuất văn bản từ các tệp CV do người dùng tải lên (hỗ trợ .pdf và .docx).

**Cách 2: Node.js / Express (Tùy chọn/Dự phòng)**
Nếu sử dụng server Node.js (`server.js`), di chuyển vào thư mục `backend` và cài đặt qua `npm`:

```bash
cd backend
npm install
```

*Phân tích các thư viện Node.js:*
- `express`, `cors`, `dotenv`: Framework xây dựng API và xử lý middleware cơ bản.
- `mysql2`: Thư viện kết nối MySQL hiệu năng cao cho Node.js.
- `nodemon`: Tự động reload server trong quá trình phát triển (Dev).

*Lưu ý chung:* Bạn phải tạo và cấu hình file `.env` tại thư mục backend chứa thông tin kết nối Database và `GROQ_API_KEY`.

### 2. Cài đặt Frontend (ReactJS)
Di chuyển vào thư mục `frontend` và chạy lệnh cài đặt để tự động tải toàn bộ các packages:

```bash
cd frontend
npm install
```

*Phân tích các thư viện Frontend đang sử dụng:*
- **Core React:** `react`, `react-dom`, `react-scripts`, `web-vitals`.
- **Routing:** `react-router-dom` (Quản lý các luồng chuyển trang trong ứng dụng).
- **UI & Icons:** 
  - `react-icons`, `lucide-react`: Kho icon đa dạng.
  - Các package FontAwesome (`@fortawesome/fontawesome-free`, `@fortawesome/react-fontawesome`,...): Thêm lựa chọn icon chuyên nghiệp cho giao diện.
- **Tính năng nổi bật:** `html2pdf.js` (Hỗ trợ chuyển đổi nhanh giao diện HTML thành file PDF, dùng chính trong chức năng xuất Portfolio).
- **Kiểm thử (Testing):** `@testing-library/react`, `@testing-library/jest-dom`,... (Phục vụ quá trình phát triển và kiểm tra component).

---

## 🚀 Hướng dẫn khởi chạy dự án

**Bước 1: Khởi động Database**
- Bật XAMPP (hoặc MySQL Server của bạn), đảm bảo MySQL đang chạy ở cổng 3306.
- Tạo database `career_ai` và import cấu trúc bảng (table) vào database.

**Bước 2: Khởi chạy Backend**
Mở terminal, di chuyển vào thư mục `backend`:
```bash
python app.py
```
*(Server Flask sẽ mặc định chạy ở cổng `http://localhost:5000`)*

**Bước 3: Khởi chạy Frontend**
Mở một terminal khác, di chuyển vào thư mục `frontend`:
```bash
npm start
```
*(Giao diện web sẽ tự động mở ở cổng `http://localhost:3000`)*

---

## 🌳 Cấu trúc thư mục (Branching Strategy)
- `main`: Nhánh chính chứa code đã hoàn chỉnh.
- `feature/*`: Các nhánh con phát triển từng tính năng riêng biệt (như `feature/baotoan`, `feature/auth`, `feature/portfolio-builder`, v.v...).
