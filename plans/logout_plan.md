# Kế hoạch triển khai chức năng Đăng xuất (Logout)

Tài liệu này chi tiết các bước đã thực hiện để xây dựng chức năng đăng xuất bảo mật cho ứng dụng Damod.

## 1. Phân tích hiện trạng

*   **Backend**: Sử dụng FastAPI với xác thực JWT (stateless).
*   **Frontend**: Next.js 15+ với token lưu trong `localStorage`.

## 2. Mục tiêu

1.  Cho phép người dùng xóa phiên làm việc hiện tại một cách an toàn.
2.  **Vô hiệu hóa token ở phía Backend** (Token Blacklisting) để ngăn chặn việc tái sử dụng token đã đăng xuất.
3.  Cập nhật giao diện người dùng (Navbar) để phản ánh trạng thái xác thực.

## 3. Các bước đã triển khai

### Bước 1: Backend - Token Blacklisting
- **Model**: Tạo bảng `TokenBlacklist` lưu `jti` (JWT ID) và thời gian hết hạn.
- **Payload**: Thêm trường `jti` vào JWT khi tạo token.
- **CRUD**: Triển khai logic kiểm tra và thêm token vào danh sách đen.
- **Middleware**: Cập nhật `get_current_user` để từ chối các token đã bị blacklist.
- **Endpoint**: Thêm `POST /auth/logout` để người dùng chủ động vô hiệu hóa token.

### Bước 2: Frontend - Giao diện & Điều hướng
- **Component**: Tạo `Navbar.tsx` sử dụng Client Component để theo dõi trạng thái người dùng.
- **Logic**: Khi đăng xuất, gọi API backend trước khi xóa `localStorage` và chuyển hướng.
- **Layout**: Tích hợp `Navbar` vào `RootLayout`.

## 4. Danh sách công việc (Checklist)

### Backend
- [x] Tạo model `TokenBlacklist` trong `backend/app/models/`.
- [x] Cập nhật hàm `create_access_token` trong `backend/app/core/auth.py` để thêm `jti`.
- [x] Viết logic thêm vào blacklist trong `backend/app/crud/`.
- [x] Thêm endpoint `logout` trong `backend/app/api/api_v1/endpoints/auth.py`.
- [x] Cập nhật dependency kiểm tra token trong `backend/app/api/deps.py`.

### Frontend
- [x] Tạo file `frontend/src/components/Navbar.tsx`.
- [x] Tích hợp `Navbar` vào `frontend/src/app/layout.tsx`.
- [x] Chỉnh sửa `frontend/src/app/page.tsx`.
- [x] Kiểm tra luồng đăng xuất toàn diện (cả Client và Server).

## 5. Lưu ý về bảo mật

*   Cơ chế Blacklist giúp vô hiệu hóa token ngay cả khi nó vẫn còn hạn.
*   Cần có tiến trình (Cron job) để dọn dẹp các token đã hết hạn trong bảng `TokenBlacklist` để tránh làm đầy database.
