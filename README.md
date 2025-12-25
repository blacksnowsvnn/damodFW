# Dự án Damod (damodFW)

Dự án **Damod** là một framework ứng dụng full-stack hiện đại, được thiết kế để triển khai nhanh chóng và bảo mật cao. Hệ thống sử dụng kiến trúc container hóa với Docker, giúp việc quản lý và mở rộng trở nên dễ dàng.

## 🚀 Tính năng chính

- **Frontend**: Next.js 15 với Tailwind CSS và Shadcn/UI.
- **Backend**: FastAPI (Python) hiệu năng cao, hỗ trợ JWT Auth.
- **Cơ sở dữ liệu**: PostgreSQL với cơ chế tự động khởi tạo.
- **Quản trị**: Tích hợp sẵn pgAdmin, tự động cấu hình server kết nối.
- **Proxy**: Nginx làm Reverse Proxy, hỗ trợ SSL và quản lý domain linh hoạt.
- **Bảo mật**: Tự động lọc thông tin nhạy cảm trong logs, mã hóa mật khẩu Bcrypt.

## 🛠️ Yêu cầu hệ thống

- Docker & Docker Compose
- Node.js (để phát triển frontend)
- Python 3.10+ (để phát triển backend)

## 🏁 Bắt đầu nhanh

1. **Clone repository**:
   ```bash
   git clone [url-cua-ban]
   cd [ten-thu-muc]
   ```

2. **Cấu hình môi trường**:
   ```bash
   cp .env.example .env
   # Chỉnh sửa các giá trị trong .env nếu cần
   ```

3. **Khởi chạy bằng Docker**:
   ```bash
   docker-compose up -d --build
   ```

4. **Cài đặt hệ thống**:
   Truy cập `http://localhost/install` để cấu hình cơ sở dữ liệu và tài khoản quản trị lần đầu.

## 📚 Tài liệu hướng dẫn

Xem chi tiết tại **[Trung tâm tài liệu (docs/README.md)](docs/README.md)**.

Các tài liệu chính bao gồm:
- [Hướng dẫn cài đặt](docs/setup.md)
- [Kiến trúc hệ thống](docs/architecture.md)
- [Tài liệu API](docs/api_endpoints.md)
- [Cấu trúc Cơ sở dữ liệu](docs/database.md)
- [Cấu hình biến môi trường](docs/environment.md)
- [Quy chuẩn phát triển](docs/development_guidelines.md)
- [Bảo mật](docs/security.md)

## 📄 Giấy phép

Dự án được phát triển cho mục đích nội bộ.
