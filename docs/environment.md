# Cấu trúc biến môi trường (damodFW)

[← Quay lại mục lục](README.md)

Dự án **damodFW** sử dụng file `.env` tại thư mục gốc để quản lý các cấu hình nhạy cảm và thay đổi theo môi trường.

## Danh sách các biến môi trường

Dưới đây là các biến hiện đang được sử dụng trong hệ thống:

### 1. Cấu hình chung (General)
- **`APP_NAME`**: Tên của ứng dụng.
- **`DOMAIN`**: Tên miền chính của ứng dụng (ví dụ: `yourdomain.com`).

### 2. Backend (FastAPI & PostgreSQL)
- **`POSTGRES_USER`**: Tên người dùng của cơ sở dữ liệu PostgreSQL.
- **`POSTGRES_PASSWORD`**: Mật khẩu của cơ sở dữ liệu (Mặc định: `changeme`).
- **`POSTGRES_DB`**: Tên cơ sở dữ liệu.
- **`POSTGRES_HOST`**: Host của database (trong Docker là `db`).
- **`POSTGRES_PORT`**: Cổng kết nối (mặc định là `5432`).
- **`DATABASE_URL`**: Đường dẫn kết nối đầy đủ (ví dụ: `postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@db:5432/<POSTGRES_DB>`).

### 3. pgAdmin (Database Management)
- **`PGADMIN_DEFAULT_EMAIL`**: Email dùng để đăng nhập vào pgAdmin.
- **`PGADMIN_DEFAULT_PASSWORD`**: Mật khẩu đăng nhập vào pgAdmin (Mặc định: `changeme`).

### 4. Frontend (Next.js)
- **`NEXT_PUBLIC_API_URL`**: URL của Backend API mà Frontend sẽ gọi từ trình duyệt. Lưu ý tiền tố `NEXT_PUBLIC_` là bắt buộc để Next.js cho phép truy cập biến này ở phía client.
    - Giá trị mặc định: `http://yourdomain.com/backend`
- **`NEXT_PUBLIC_APP_NAME`**: Tên ứng dụng hiển thị trên giao diện người dùng.

## Quản lý cấu hình với Pydantic-settings

Dự án sử dụng thư viện `pydantic-settings` để quản lý và validate các biến môi trường một cách tập trung tại `backend/app/core/config.py`.

### Đặc điểm nổi bật:
- **Tự động nạp file `.env`**: Tự động tìm kiếm và nạp biến từ file `.env` ở thư mục gốc hoặc `/app/project/.env` trong môi trường Docker.
- **Ép kiểu và Validate**: Các biến được ép kiểu tự động (ví dụ: `POSTGRES_PORT` sẽ luôn là `int`). Nếu biến thiếu hoặc sai kiểu, ứng dụng sẽ báo lỗi ngay khi khởi động.
- **Xây dựng cấu hình động**: 
    - `DATABASE_URL` được xây dựng tự động từ các biến thành phần (`POSTGRES_USER`, `POSTGRES_PASSWORD`, v.v.) thông qua hàm `get_database_url()`.
    - Hỗ trợ ghi đè linh hoạt: Nếu `DATABASE_URL` được khai báo trực tiếp trong `.env`, nó sẽ được ưu tiên sử dụng.
- **CORS Configuration**: Tự động xử lý danh sách các domain được phép truy cập (`BACKEND_CORS_ORIGINS`) từ chuỗi ngăn cách bởi dấu phẩy trong `.env`.

## Quản lý cấu hình động (Dynamic Configuration)

Dự án sử dụng cơ chế nạp biến môi trường động để tối ưu hóa trải nghiệm người dùng và nhà phát triển:

1. **Khởi tạo Singleton**: Đối tượng `settings` được khởi tạo một lần duy nhất khi ứng dụng bắt đầu, đảm bảo tính nhất quán của cấu hình trong suốt vòng đời ứng dụng.
2. **Cấu hình Nginx**: Domain được cấu hình trong Install Wizard sẽ tự động cập nhật vào file `nginx/default.conf` và reload service Nginx trong container.

---

## Cấu hình lưu trữ trong Database

Ngoài file `.env`, một số cấu hình động hiện được lưu trữ trong bảng `settings` của database để có thể thay đổi trực tiếp qua giao diện (sau khi được cài đặt):

- **`site_title`**: Tên hiển thị của website.
- **`system_installed`**: Đánh dấu hệ thống đã được cài đặt thành công (`true/false`).
- **`domain`**: Tên miền chính được sử dụng cho hệ thống.
