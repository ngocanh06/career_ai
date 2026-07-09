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

Để chạy được dự án này, bạn cần cài đặt Node.js (dành cho Frontend) và Python 3 (dành cho Backend), cùng với hệ quản trị CSDL MySQL.

### 1. Cài đặt Backend (Python / Flask)
Di chuyển vào thư mục `backend` và cài đặt các thư viện sau thông qua `pip`:

```bash
cd backend
pip install flask
pip install flask-cors
pip install pymysql
pip install python-dotenv
pip install groq
pip install pdfplumber
pip install python-docx
```

*Lưu ý:* Cần cấu hình file `.env` tại thư mục backend chứa thông tin kết nối CSDL và `GROQ_API_KEY`.

### 2. Cài đặt Frontend (ReactJS)
Di chuyển vào thư mục `frontend` và chạy lệnh cài đặt qua `npm`:

```bash
cd frontend
npm install
```

Các package chính mà dự án đang sử dụng bao gồm (sẽ tự động tải qua `npm install`):
- `react`, `react-dom`, `react-scripts`: Core của ReactJS.
- `react-router-dom`: Quản lý điều hướng các trang (routing).
- `react-icons`, `lucide-react`, `@fortawesome/...`: Các thư viện cung cấp Icon UI đẹp mắt.
- `html2pdf.js`: Hỗ trợ xuất file PDF trực tiếp từ HTML trong chức năng xây dựng Portfolio.

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
