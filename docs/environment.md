# Cấu trúc biến môi trường (damodFW)

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

## Quản lý cấu hình động (Dynamic Configuration)

Dự án sử dụng cơ chế nạp biến môi trường động để tối ưu hóa trải nghiệm người dùng và nhà phát triển:

1. **Nạp lại .env không cần Restart**: Backend (FastAPI) sẽ tự động kiểm tra và nạp lại file `.env` mỗi khi có yêu cầu truy cập vào các biến cấu hình quan trọng (như `DATABASE_URL`, `DOMAIN`, `SECRET_KEY`).
2. **Cấu hình Nginx**: Domain được cấu hình trong Install Wizard sẽ tự động cập nhật vào file `nginx/default.conf` và reload service Nginx trong container.

---

## Cấu hình lưu trữ trong Database

Ngoài file `.env`, một số cấu hình động hiện được lưu trữ trong bảng `settings` của database để có thể thay đổi trực tiếp qua giao diện (sau khi được cài đặt):

- **`site_title`**: Tên hiển thị của website.
- **`system_installed`**: Đánh dấu hệ thống đã được cài đặt thành công (`true/false`).
- **`domain`**: Tên miền chính được sử dụng cho hệ thống.
