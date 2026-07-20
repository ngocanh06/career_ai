import sys
import io
# Đảm bảo mã hóa utf-8 cho stdout/stderr trên Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes import all_blueprints

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Đăng ký toàn bộ Blueprint với tiền tố /api
for bp in all_blueprints:
    app.register_blueprint(bp, url_prefix='/api')

@app.route('/')
def index():
    return jsonify({'message': 'CareerAI Backend API (Python/Flask) đang chạy!'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"CareerAI Flask Backend running at http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)
