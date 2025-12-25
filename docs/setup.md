# Hướng dẫn cài đặt và chạy dự án

Tài liệu này hướng dẫn cách thiết lập môi trường và chạy dự án **damodFW**.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

- **Git**: Để quản lý mã nguồn.
- **Docker**: [Cài đặt Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Thường đi kèm với Docker Desktop.
- **Tên miền ảo**: Cấu hình file `hosts` để nhận diện tên miền của bạn (ví dụ: `yourdomain.com`).

## 1. Cấu hình Git & SSH (Dành cho nhà phát triển)

Để làm việc với repository GitHub của dự án, bạn nên cấu hình SSH Key:

### Cấu hình định danh
```bash
git config --global user.name "blacksnowsvnn"
git config --global user.email "vnbacksnows@gmail.com"
```

### Kiểm tra kết nối SSH
Nếu bạn đã thêm SSH Key vào GitHub, hãy kiểm tra bằng lệnh:
```bash
ssh -T git@github.com
```

## 2. Cấu hình File Hosts

Để truy cập ứng dụng qua tên miền `http://yourdomain.com`, bạn cần thêm dòng sau vào file hosts của hệ thống:

- **Linux/macOS**: `/etc/hosts`
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`

Thêm dòng:
```text
127.0.0.1 yourdomain.com
```

## 3. Khởi chạy dự án bằng Docker

Thực hiện các bước sau để khởi động toàn bộ hệ thống:

1. **Clone dự án**:
   ```bash
   git clone git@github.com:blacksnowsvnn/damodFW.git
   cd damodFW
   ```

2. **Chuẩn bị file môi trường**:
   Sao chép file mẫu và điều chỉnh các thông số cần thiết:
   ```bash
   cp .env.example .env
   ```

3. **Khởi động bằng Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

4. **Kiểm tra trạng thái**:
   ```bash
   docker compose ps
   ```
   Bạn sẽ thấy các container: `fastapi_app`, `nextjs_app`, `nginx_proxy`, `postgres_db`, và `pgadmin_panel` ở trạng thái `Running`.

## 4. Quản lý Thư viện (Dependencies)

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
