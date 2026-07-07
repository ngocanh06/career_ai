# CareerAI Frontend

Dự án Frontend được xây dựng bằng ReactJS (khởi tạo qua Create React App).

## Yêu cầu môi trường
- Node.js (phiên bản ổn định mới nhất, LTS)
- npm hoặc yarn

## Khởi chạy dự án (Local Development)

```bash
cd frontend
npm install
npm start
```
## Cài đặt các dependencies bị thiếu
cd frontend
npm install react-icons
npm install lucide-react
npm install @fortawesome/fontawesome-free
Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng trên trình duyệt.

## Lưu ý về Code & Cấu trúc (Dành cho Team Leader)

### 1. Cấu trúc Module Xác thực (Auth)
Module Authentication đã được hoàn thiện về mặt giao diện (UI) tại thư mục `src/components/Auth`. Cấu trúc như sau:
- `Login.js`: Trang đăng nhập, chia layout hai cột (blue brand bên trái và white form bên phải).
- `Register.js`: Trang đăng ký, chia làm nhiều bước (Role Selection -> Personal Info -> Account Details), có thanh trạng thái tiến độ (Step indicator).
- `ForgotPassword.js`: Trang quên mật khẩu (Sử dụng layout thẻ trung tâm - single card ở giữa màn hình).
- `Auth.css`: File CSS chung duy nhất cho toàn bộ module Auth. Các class CSS được đặt tên với prefix rõ ràng (VD: `auth-`, `fp-`, `reg-`) để tránh xung đột style với các module khác trong tương lai.

### 2. Ghi chú về UI/UX và Performance
- **Assets**: Các icon sử dụng hoàn toàn bằng thẻ `<svg>` inline, giúp giảm dung lượng tải trang, không phải phụ thuộc vào thư viện icon bên thứ ba.
- **Responsive**: Giao diện được thiết kế hoàn toàn tương thích trên mọi kích thước màn hình (Mobile First / Tablet / Desktop). Dưới kích thước 768px, layout dạng cột đôi sẽ được stack thành hàng dọc.

### 3. Định hướng phát triển tiếp theo (Task Backlog)
- **Tích hợp API Backend**: Các form submit hiện tại mới chỉ dựng layout và chặn hành vi reload trang bằng `e.preventDefault()`, chưa có logic API call thực tế. Cần kết nối với backend API sau khi backend hoàn thiện chức năng login/register.
- **State Management**: Cần setup Context API, Redux hoặc Zustand để lưu trữ và quản lý global state như `user profile` hay `auth token` sau khi user đăng nhập thành công.
- **Routing & Bảo vệ Route**: Cần tạo các `PrivateRoute` hoặc `ProtectedRoute` để kiểm tra trạng thái xác thực. Ngăn chặn người dùng vãng lai truy cập vào các dashboard sau này. Route `/` tạm thời đang được redirect trực tiếp sang `/login`.
