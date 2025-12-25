# Kiến trúc hệ thống và Cấu hình Nginx

Tài liệu này giải thích cách các thành phần trong hệ thống tương tác với nhau và vai trò của Nginx.

## Sơ đồ luồng dữ liệu

```text
Người dùng (Browser) 
      │
      ▼
   Nginx (Cổng 80) ───┐
      │               │
      ├─ / ──────────▶ Frontend (Next.js:3000)
      │
      └─ /backend/ ──▶ Backend (FastAPI:8000) ──▶ PostgreSQL (db:5432)

Quản trị viên
      │
      ▼
   pgAdmin (Cổng 5050) ──▶ PostgreSQL (db:5432)
```

## Các thành phần chính

### 1. Frontend (Next.js)
- Chạy bên trong container `nextjs_app`.
- Lắng nghe tại cổng `3000`.
- **Công nghệ chính**:
    - **Next.js 15+**: Framework React hỗ trợ Server Components.
    - **Tailwind CSS v4**: Framework CSS utility-first mới nhất.
    - **shadcn/ui**: Bộ component UI được xây dựng trên Radix UI và Tailwind CSS.
- **Cơ chế đặc biệt**:
    - **InstallGuard**: Một component bao bọc toàn bộ ứng dụng (`layout.tsx`) để kiểm tra trạng thái cài đặt hệ thống. Nếu chưa cài đặt, tự động chuyển hướng về `/install`.
    - **API Helper**: Sử dụng `src/lib/api.ts` để xử lý các yêu cầu HTTP, tự động đính kèm Token JWT.
- Giao tiếp với Backend thông qua URL được cấu hình trong biến môi trường (thường là `http://yourdomain.com/backend`).

### 2. Backend (FastAPI)
- Chạy bên trong container `fastapi_app`.
- Lắng nghe tại cổng `8000`.
- Sử dụng `root_path="/backend"` để đồng bộ với cấu hình reverse proxy của Nginx.
- Kết nối với PostgreSQL qua `DATABASE_URL`.

### 3. Database (PostgreSQL)
- Chạy bên trong container `postgres_db`.
- Lắng nghe tại cổng `5432`.
- Lưu trữ dữ liệu bền vững qua Docker Volume `postgres_data`.

### 4. Database Management (pgAdmin)
- Chạy bên trong container `pgadmin_panel`.
- Phục vụ giao diện web tại cổng `5050`.
- Cho phép quản lý trực quan cơ sở dữ liệu PostgreSQL.

### 5. Nginx (Reverse Proxy)
- Chạy bên trong container `nginx_proxy`.
- Là điểm tiếp nhận duy nhất cho mọi yêu cầu từ người dùng tại cổng `80`.
- **Vai trò**:
    - Điều hướng traffic dựa trên đường dẫn (Path-based routing).
    - Giải quyết vấn đề CORS bằng cách phục vụ cả Frontend và Backend trên cùng một domain (ví dụ: `yourdomain.com`).

## Cấu hình Nginx chi tiết

File cấu hình nằm tại `nginx/default.conf`.

### Điều hướng Frontend
```nginx
location / {
    proxy_pass http://frontend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
Mọi yêu cầu đến root `/` sẽ được chuyển tiếp đến service `frontend` trong mạng Docker.

### Điều hướng Backend
```nginx
location /backend/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
Lưu ý dấu `/` ở cuối `http://backend:8000/` giúp loại bỏ tiền tố `/backend` trước khi gửi yêu cầu đến FastAPI.

## Cơ chế xác thực và Bảo mật

Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực người dùng.

### 1. Luồng xác thực
1. Người dùng gửi email/mật khẩu đến Backend.
2. Backend kiểm tra và trả về một `access_token` chứa thông tin người dùng và mã định danh duy nhất `jti`.
3. Frontend lưu token vào `localStorage` và gửi kèm trong header `Authorization: Bearer <token>` cho các yêu cầu tiếp theo.

### 2. Cơ chế Đăng xuất bảo mật (Token Blacklisting)
Để đảm bảo an toàn, khi người dùng đăng xuất:
- Frontend xóa token khỏi bộ nhớ trình duyệt.
- Backend nhận yêu cầu đăng xuất và đưa `jti` của token đó vào **Token Blacklist** trong cơ sở dữ liệu.
- Mọi yêu cầu tiếp theo sử dụng token đã bị blacklist sẽ bị Backend từ chối (trả về lỗi 401), ngay cả khi token đó chưa hết hạn về mặt thời gian (`exp`).

## Mạng Docker (Docker Network)

Tất cả các container được kết nối chung một mạng mặc định do Docker Compose tạo ra. Điều này cho phép Nginx gọi các service khác bằng tên của chúng (`frontend`, `backend`) thay vì địa chỉ IP.
