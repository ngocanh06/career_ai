import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_otp_email(to_email, otp_code, action_type):
    try:
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 465))
        smtp_user = os.getenv('SMTP_USER', '')
        smtp_pass = os.getenv('SMTP_PASS', '')

        if not smtp_user or not smtp_pass:
            print("CẢNH BÁO: Chưa cấu hình SMTP_USER và SMTP_PASS, bỏ qua gửi mail thực tế.")
            print(f"[{action_type}] OTP cho {to_email} là: {otp_code}")
            return True

        if action_type == 'register':
            subject = "Mã xác nhận đăng ký tài khoản CareerAI"
            body = f"Chào bạn,\n\nMã xác nhận (OTP) của bạn là: {otp_code}\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nCareerAI Team"
        else:
            subject = "Mã xác nhận khôi phục mật khẩu CareerAI"
            body = f"Chào bạn,\n\nMã xác nhận khôi phục mật khẩu (OTP) của bạn là: {otp_code}\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nCareerAI Team"

        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = f"CareerAI <{smtp_user}>"
        msg['To'] = to_email

        # Dùng SSL
        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Lỗi gửi email: {e}")
        return False
