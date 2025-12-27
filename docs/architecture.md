# Kiến trúc hệ thống và Cấu hình Nginx (damodFW)

[← Quay lại mục lục](README.md)

Tài liệu này giải thích cách các thành phần trong hệ thống **damodFW** tương tác với nhau và vai trò của Nginx.

## Sơ đồ luồng dữ liệu

```text
Người dùng (Browser) 
      │
      ▼
   Nginx (Cổng 80) ───┐
      │               │
      ├─ / ──────────▶ Frontend (Next.js:3000) ─┐
      │                                          │
      └─ /backend/ ──▶ Backend (FastAPI:8000) ──┼──▶ PostgreSQL (db:5432)
                                                 │
                                                 └──▶ Uploads (/app/uploads)

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
    - **Next.js 16+**: Framework React hỗ trợ App Router và Server Components.
    - **Tailwind CSS 4+**: Framework CSS utility-first mới nhất.
    - **shadcn/ui**: Bộ component UI được xây dựng trên Radix UI và Tailwind CSS.
    - **TypeScript 5+**: Type-safe development.
- **Cơ chế đặc biệt**:
    - **InstallGuard**: Một component bao bọc toàn bộ ứng dụng (`layout.tsx`) để kiểm tra trạng thái cài đặt hệ thống. Nếu chưa cài đặt, tự động chuyển hướng về `/install`.
    - **DashboardGuard**: Component bảo vệ các route dashboard, chỉ cho phép user với `rank < 5` truy cập.
    - **API Helper**: Sử dụng `src/lib/api.ts` để xử lý các yêu cầu HTTP, tự động đính kèm Token JWT và xử lý lỗi.
    - **Dynamic Theme System**: Fetch settings từ backend server-side và inject CSS variables vào `<html>` tag để áp dụng theme động.
- Giao tiếp với Backend thông qua Nginx reverse proxy tại `/api/v1`.

### 2. Backend (FastAPI)
- Chạy bên trong container `fastapi_app`.
- Lắng nghe tại cổng `8000`.
- **Xác thực và Validation**: Sử dụng **Pydantic v2** để validate dữ liệu đầu vào và đầu ra cho 100% API endpoints.
- **Quản lý cấu hình**: Sử dụng `pydantic-settings` để quản lý tập trung các biến môi trường từ file `.env` và hỗ trợ load động.
- **CRUD Operations**: Sử dụng pattern CRUD với SQLAlchemy ORM cho tất cả database operations.
- **Settings System**: Bảng `Setting` lưu trữ key-value pairs cho cấu hình hệ thống (SEO, Theme, Scripts).
- **File Upload**: Hỗ trợ upload file vào `/app/uploads` và serve qua Nginx.
- Kết nối với PostgreSQL qua `DATABASE_URL` (được tự động xây dựng từ các biến thành phần).

### 3. Database (PostgreSQL)
- Chạy bên trong container `postgres_db`.
- Lắng nghe tại cổng `5432`.
- Lưu trữ dữ liệu bền vững qua Docker Volume `postgres_data`.

### 4. Database Management (pgAdmin)
- Chạy bên trong container `pgadmin_panel`.
- Phục vụ giao diện web tại cổng `5050`.
- Cho phép quản lý trực quan cơ sở dữ liệu PostgreSQL.
- **Cơ chế tự động**: Được cấu hình tự động sau khi cài đặt, bao gồm cả việc đăng ký server và đồng bộ tài khoản người dùng.

### 5. Nginx (Reverse Proxy)
- Chạy bên trong container `nginx_proxy`.
- Là điểm tiếp nhận duy nhất cho mọi yêu cầu từ người dùng tại cổng `80`.
- **Vai trò**:
    - Điều hướng traffic dựa trên đường dẫn (Path-based routing).
    - Giải quyết vấn đề CORS bằng cách phục vụ cả Frontend và Backend trên cùng một domain (ví dụ: `yourdomain.com`).
    - **Reload động**: Được tự động cập nhật domain và reload thông qua Backend sau khi cài đặt.

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

### 3. Bảo mật Logs và Dữ liệu nhạy cảm
- **Sanitized Logs**: Hệ thống tự động ẩn mật khẩu và các thông tin nhạy cảm khác trong nhật ký server (logs) thông qua các cơ chế lọc chuỗi và SQL sanitization.
- **An toàn API**: Các thông báo lỗi chi tiết của hệ thống (như lỗi kết nối DB) được lọc bỏ trước khi trả về cho client, tránh lộ thông tin hạ tầng.

## Hệ thống Theme động (Dynamic Theme System)

Hệ thống hỗ trợ thay đổi theme (màu sắc, bo góc) động mà không cần reload trang.

### 1. Server-Side Theme Injection
- Backend lưu trữ theme settings trong bảng `Setting` (PostgreSQL).
- Frontend fetch settings qua API `/settings/public` trong server component `layout.tsx`.
- CSS variables được inject vào `<html>` tag với attribute `data-theme-base`.
- Hỗ trợ 8 base themes: `neutral`, `red`, `blue`, `green`, `violet`, `orange`, `yellow`, `rose`.

### 2. Client-Side Theme Update
- Khi admin thay đổi theme trong Dashboard Settings:
  - Settings được lưu vào database qua API `/settings/bulk`.
  - JavaScript cập nhật CSS variables trực tiếp vào `document.documentElement`.
  - Theme được áp dụng ngay lập tức không cần reload trang.
- Các CSS variables được cập nhật:
  - `--radius`: Độ bo góc (và tất cả biến phụ thuộc: `--radius-sm`, `--radius-md`, etc.)
  - `--primary`: Màu chủ đạo (OKLCH color space)
  - `data-theme-base` attribute: Kích hoạt base theme colors từ `globals.css`

### 3. Theme Architecture
```
globals.css (Base themes)
    ↓
[data-theme-base="orange"] { --primary: oklch(...); }
    ↓
<html data-theme-base="orange">
    ↓
:root { --radius: 0.625rem; --primary: oklch(...); }
    ↓
Components sử dụng CSS variables
```

## Cơ chế đặc biệt và Khởi động lạnh (Cold Start)

Hệ thống được thiết kế để có thể khởi động ngay cả khi chưa có cấu hình (`.env`) hoặc cơ sở dữ liệu chưa sẵn sàng.

### 1. Khởi động lạnh (Cold Start)
- Khi Docker Compose khởi chạy lần đầu, Backend sẽ sử dụng các giá trị mặc định để chạy ứng dụng cơ bản.
- Frontend sử dụng `InstallGuard` để phát hiện trạng thái chưa cài đặt (thông qua API `/install/check`) và bắt buộc người dùng hoàn thành **Install Wizard**.

### 2. Cấu hình động (Dynamic Configuration)
- **Backend**: Sử dụng module `app/core/config.py` để nạp lại biến môi trường từ file `.env` mỗi khi có yêu cầu truy cập, giúp áp dụng thay đổi ngay lập tức mà không cần restart container.
- **Frontend**: Layout server component fetch settings mỗi request với `cache: 'no-store'` để đảm bảo theme luôn mới nhất.
- **Nginx**: File `nginx/default.conf` được quản lý động bởi `nginx_manager.py`. Khi người dùng cấu hình domain trong Install Wizard, Nginx sẽ được cập nhật và reload tự động bên trong container.
- **Settings System**: Admin có thể thay đổi SEO, Theme, Custom Scripts qua Dashboard mà không cần restart services.

### 3. Reset Database trong Install
- Để đảm bảo tính nhất quán, quá trình cài đặt sẽ thực hiện lệnh `drop_all` để xóa sạch các bảng cũ (nếu có) và `create_all` để khởi tạo lại toàn bộ schema từ mã nguồn.

## Quản lý File và Uploads

### 1. Upload Directory
- Files được upload vào `/app/uploads` trong container backend.
- Directory được mount vào container frontend tại `/app/public/uploads` để serve static files.
- Nginx phục vụ files tại path `/uploads/*`.

### 2. Supported File Types
- Images: `jpg`, `jpeg`, `png`, `gif`, `svg`, `webp`
- Icons: `ico` (cho favicon)
- Được validate ở cả frontend và backend.

### 3. File Access Flow
```
Admin upload file → Backend (/api/v1/upload)
    ↓
Lưu vào /app/uploads/filename.jpg
    ↓
Trả về URL: /uploads/filename.jpg
    ↓
Frontend/Nginx serve file công khai
```

## Mạng Docker (Docker Network)

Tất cả các container được kết nối chung một mạng mặc định do Docker Compose tạo ra. Điều này cho phép Nginx gọi các service khác bằng tên của chúng (`frontend`, `backend`) thay vì địa chỉ IP.

### Service Communication:
- **Frontend → Backend**: Gọi qua service name `backend:8000` (internal Docker network)
- **Browser → Backend**: Gọi qua Nginx proxy `/api/v1/*`
- **All services → Database**: Kết nối qua `db:5432`

### Volume Sharing:
- `postgres_data`: Persistent storage cho PostgreSQL
- `./backend/uploads`: Shared giữa backend và frontend để serve uploaded files
