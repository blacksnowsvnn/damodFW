# Cấu trúc biến môi trường (damodFW)

Dự án **damodFW** sử dụng file `.env` tại thư mục gốc để quản lý các cấu hình nhạy cảm và thay đổi theo môi trường.

## Danh sách các biến môi trường

Dưới đây là các biến hiện đang được sử dụng trong hệ thống:

### 1. Cấu hình chung (General)
- **`APP_NAME`**: Tên của ứng dụng.
- **`DOMAIN`**: Tên miền chính của ứng dụng (ví dụ: `yourdomain.com`).

### 2. Backend (FastAPI & PostgreSQL)
- **`POSTGRES_USER`**: Tên người dùng của cơ sở dữ liệu PostgreSQL.
- **`POSTGRES_PASSWORD`**: Mật khẩu của cơ sở dữ liệu.
- **`POSTGRES_DB`**: Tên cơ sở dữ liệu.
- **`POSTGRES_HOST`**: Host của database (trong Docker là `db`).
- **`POSTGRES_PORT`**: Cổng kết nối (mặc định là `5432`).
- **`DATABASE_URL`**: Đường dẫn kết nối đầy đủ (ví dụ: `postgresql://user:pass@db:5432/dbname`).

### 3. pgAdmin (Database Management)
- **`PGADMIN_DEFAULT_EMAIL`**: Email dùng để đăng nhập vào pgAdmin.
- **`PGADMIN_DEFAULT_PASSWORD`**: Mật khẩu đăng nhập vào pgAdmin.

### 4. Frontend (Next.js)
- **`NEXT_PUBLIC_API_URL`**: URL của Backend API mà Frontend sẽ gọi từ trình duyệt. Lưu ý tiền tố `NEXT_PUBLIC_` là bắt buộc để Next.js cho phép truy cập biến này ở phía client.
    - Giá trị mặc định: `http://yourdomain.com/backend`
- **`NEXT_PUBLIC_APP_NAME`**: Tên ứng dụng hiển thị trên giao diện người dùng.

## Quản lý theo môi trường

Hệ thống hỗ trợ triển khai trên nhiều môi trường khác nhau. Bạn nên tạo các file `.env` tương ứng:

1. **Local Development (`.env.local`)**: Dùng cho phát triển cục bộ.
2. **Staging (`.env.staging`)**: Môi trường kiểm thử giống production.
3. **Production (`.env.production`)**: Môi trường thực tế.

### Cách sử dụng

- Trong Docker Compose, bạn có thể chỉ định file env bằng flag `--env-file`:
  ```bash
  docker compose --env-file .env.production up -d
  ```
- Hoặc sao chép file tương ứng thành `.env` trước khi chạy:
  ```bash
  cp .env.production .env
  docker compose up -d
  ```

## Bảo mật

- **KHÔNG** bao giờ cam kết (commit) file `.env` thực tế hoặc bất kỳ file `.env.*` nào chứa dữ liệu thật lên hệ thống quản lý phiên bản (Git).
- Sử dụng file `.env.example` để làm mẫu cho các thành viên khác.
- Đối với Production, khuyến khích sử dụng các dịch vụ quản lý bí mật như AWS Secrets Manager, HashiCorp Vault hoặc tính năng Secrets của CI/CD (GitHub Actions, GitLab CI).

---

## Cấu hình lưu trữ trong Database

Ngoài file `.env`, một số cấu hình động hiện được lưu trữ trong bảng `settings` của database để có thể thay đổi trực tiếp qua giao diện (sau khi được cài đặt):

- **`site_title`**: Tên hiển thị của website (thay thế cho `APP_NAME` trong một số trường hợp).
- **`system_installed`**: Đánh dấu hệ thống đã được cài đặt thành công (`true/false`).
