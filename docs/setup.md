# Hướng dẫn cài đặt và chạy dự án

Tài liệu này hướng dẫn cách thiết lập môi trường và chạy dự án Damod.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

- **Docker**: [Cài đặt Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Thường đi kèm với Docker Desktop.
- **Tên miền ảo**: Cấu hình file `hosts` để nhận diện tên miền của bạn (ví dụ: `yourdomain.com`).

## Cấu hình File Hosts

Để truy cập ứng dụng qua tên miền `http://yourdomain.com`, bạn cần thêm dòng sau vào file hosts của hệ thống:

- **Linux/macOS**: `/etc/hosts`
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`

Thêm dòng:
```text
127.0.0.1 yourdomain.com
```

## Khởi chạy dự án

Thực hiện các bước sau để khởi động toàn bộ hệ thống:

1. **Chuẩn bị file môi trường**:
   Đảm bảo file `.env` đã tồn tại ở thư mục gốc của dự án. Bạn có thể sao chép từ `.env.example`.

2. **Khởi động bằng Docker Compose**:
   Mở terminal tại thư mục gốc dự án và chạy lệnh:
   ```bash
   docker compose up -d --build
   ```

3. **Kiểm tra trạng thái**:
   ```bash
   docker compose ps
   ```
   Bạn sẽ thấy 5 container đang chạy: `fastapi_app`, `nextjs_app`, `nginx_proxy`, `postgres_db`, và `pgadmin_panel`.

## Quản lý Thư viện (Dependencies)

Do dự án chạy trong môi trường Docker với cấu trúc Volume riêng cho `node_modules`, việc cài đặt thư viện mới cần tuân thủ quy trình sau:

### 1. Cài đặt thư viện Frontend
Khi muốn thêm một package mới (ví dụ: `lucide-react`):
1. **Trên máy host**: Chạy lệnh `npm install lucide-react` trong thư mục `frontend` để cập nhật `package.json` và `package-lock.json`.
2. **Trong container**: Chạy lệnh sau để container cập nhật thư viện ngay lập tức mà không cần rebuild:
   ```bash
   docker exec nextjs_app npm install lucide-react
   ```

### 2. Sử dụng shadcn/ui
Dự án đã tích hợp shadcn/ui. Để thêm component mới:
```bash
docker exec -it nextjs_app npx shadcn@latest add [tên-component]
```
*Lưu ý: Sau khi thêm component trong container, hãy kiểm tra xem các file mới có xuất hiện trong thư mục `frontend/src/components/ui` trên máy host không (thông thường Docker Volume sẽ đồng bộ ngược lại).*

## Truy cập ứng dụng

Sau khi các container đã sẵn sàng, bạn cần thực hiện bước cài đặt ban đầu:

1. **Cài đặt hệ thống**:
   Truy cập `http://yourdomain.com/install` để thiết lập tài khoản Admin và cấu hình cơ bản. Hệ thống sẽ tự động chuyển hướng bạn đến đây nếu chưa được cài đặt.

2. **Sử dụng ứng dụng**:
   - **Frontend**: `http://yourdomain.com/`
   - **Backend API**: `http://yourdomain.com/backend/`
   - **API Documentation (Swagger)**: `http://yourdomain.com/backend/docs`
   - **pgAdmin (Quản lý DB)**: `http://localhost:5050`

## Dừng dự án

Để dừng và gỡ bỏ các container:
```bash
docker compose down
```
