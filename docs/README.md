# Tài liệu hướng dẫn Damod (damodFW)

Chào mừng bạn đến với trung tâm tài liệu của dự án **Damod**. Tại đây, bạn sẽ tìm thấy mọi thông tin cần thiết để cài đặt, phát triển và vận hành hệ thống.

## 📌 Danh mục tài liệu chính

### 1. [Hướng dẫn cài đặt & Chạy dự án](setup.md)
Hướng dẫn chi tiết cách thiết lập môi trường Docker, cấu hình file hosts, khởi chạy hệ thống lần đầu và sử dụng **Install Wizard**. Bao gồm cả hướng dẫn quản lý thư viện (npm/pip) và chạy kiểm thử (Pytest).

### 2. [Kiến trúc hệ thống](architecture.md)
Giải thích sơ đồ luồng dữ liệu, vai trò của các thành phần (Frontend, Backend, Nginx, PostgreSQL, pgAdmin) và các cơ chế đặc biệt như **Cold Start** hay **Dynamic Configuration**.

### 3. [Tài liệu API Endpoints](api_endpoints.md)
Danh sách chi tiết các API hiện có, yêu cầu về xác thực (JWT), cấu trúc request/response và hệ thống phân quyền (Rank).

### 4. [Cấu trúc Cơ sở dữ liệu](database.md)
Mô tả chi tiết các bảng trong PostgreSQL, sử dụng SQLAlchemy ORM, cơ chế Migration với Alembic và tích hợp quản trị qua pgAdmin.

### 5. [Cấu hình biến môi trường](environment.md)
Giải thích ý nghĩa của từng biến trong file `.env`, cách quản lý tập trung với `pydantic-settings` và cơ chế nạp cấu hình động.

---

## 🛠 Tài liệu dành cho Nhà phát triển (Sắp có)

*Các tài liệu dưới đây đang được cập nhật để hỗ trợ tốt nhất cho quá trình phát triển:*

- **[Quy chuẩn phát triển (Development Guidelines)](development_guidelines.md)**: Quy tắc viết mã, cấu trúc thư mục, quy trình Git và các best practices.
- **[Tài liệu Bảo mật (Security)](security.md)**: Các biện pháp bảo mật đã triển khai, hướng dẫn xử lý dữ liệu nhạy cảm và quy trình vá lỗi.

---

## 🚀 Liên kết nhanh

- **Trang chủ**: [http://yourdomain.com/](http://yourdomain.com/)
- **API Swagger**: [http://yourdomain.com/backend/docs](http://yourdomain.com/backend/docs)
- **Quản trị DB (pgAdmin)**: [http://localhost:5050](http://localhost:5050)
