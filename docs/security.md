# Tài liệu Bảo mật (Security)

[← Quay lại mục lục](README.md)

Bảo mật là ưu tiên hàng đầu trong dự án **damodFW**. Tài liệu này mô tả các biện pháp bảo mật đã được triển khai và các hướng dẫn để duy trì tính an toàn cho hệ thống.

## 1. Xác thực và Phân quyền (Auth & RBAC)

- **JWT (JSON Web Token)**: Sử dụng JWT để xác thực người dùng. Token bao gồm mã định danh duy nhất `jti` để quản lý phiên làm việc.
- **Mã hóa mật khẩu**: Sử dụng thuật toán **Bcrypt** để băm (hash) mật khẩu trước khi lưu vào cơ sở dữ liệu. Không bao giờ lưu mật khẩu dưới dạng văn bản thuần (plain text).
- **Token Blacklisting**: Khi người dùng đăng xuất, `jti` của token sẽ được đưa vào danh sách đen trong database. Mọi yêu cầu sử dụng token đã bị blacklist sẽ bị từ chối ngay lập tức.
- **Hệ thống Rank**: Phân quyền dựa trên cấp bậc (Rank). Admin (Rank 0) có toàn quyền, các Rank cao hơn (1-5) có quyền hạn chế. Hệ thống kiểm tra quyền nghiêm ngặt tại mỗi API endpoint.

## 2. Bảo mật dữ liệu và Logs

- **Sanitized Logs**: Hệ thống tự động lọc và ẩn các thông tin nhạy cảm trong logs như:
    - Mật khẩu người dùng.
    - Token bí mật.
    - Thông tin kết nối Database chi tiết.
- **Ẩn lỗi hệ thống**: API chỉ trả về các thông báo lỗi chung cho người dùng cuối (ví dụ: "Internal Server Error"). Các lỗi chi tiết (Stack trace, lỗi DB) chỉ được ghi lại ở server logs để phục vụ debugging, tránh lộ cấu trúc hạ tầng cho kẻ tấn công.
- **SQL Injection**: Sử dụng SQLAlchemy ORM giúp tự động ngăn chặn hầu hết các cuộc tấn công SQL Injection thông qua việc tham số hóa truy vấn (parameterized queries).

## 3. Quản lý cấu hình nhạy cảm

- **Biến môi trường (.env)**: Tất cả các thông tin nhạy cảm (API Keys, Database Passwords, Secret Keys) phải được lưu trong file `.env` và **không bao giờ** được commit vào Git.
- **Pydantic-settings**: Sử dụng để validate và quản lý tập trung các cấu hình, đảm bảo không có giá trị nhạy cảm nào bị bỏ trống hoặc sai kiểu dữ liệu khi ứng dụng khởi động.

## 4. Bảo mật hạ tầng (Nginx & Docker)

- **Reverse Proxy**: Nginx đóng vai trò là lớp bảo vệ đầu tiên, chỉ mở cổng 80 (hoặc 443) ra ngoài. Các service khác (Backend, Database, pgAdmin) chỉ giao tiếp nội bộ trong mạng Docker.
- **pgAdmin Security**: Truy cập pgAdmin yêu cầu xác thực riêng và được đồng bộ với tài khoản quản trị hệ thống.
- **CORS (Cross-Origin Resource Sharing)**: Cấu hình CORS nghiêm ngặt trong FastAPI, chỉ cho phép các domain được khai báo trong `BACKEND_CORS_ORIGINS` truy cập API.

## 5. Quy trình xử lý sự cố và Vá lỗi

1. **Phát hiện**: Theo dõi logs server và báo cáo từ người dùng để phát hiện các lỗ hổng tiềm ẩn.
2. **Khắc phục**: Ưu tiên vá lỗi bảo mật ngay khi phát hiện.
3. **Cập nhật**: Thường xuyên cập nhật các thư viện phụ thuộc (dependencies) lên phiên bản mới nhất để tránh các lỗ hổng đã biết.

---

*Mọi thắc mắc hoặc báo cáo về bảo mật, vui lòng liên hệ trực tiếp với đội ngũ phát triển.*
