# Kế hoạch xây dựng Module Install cho Website

Module này giúp thiết lập các thông tin cơ bản cho website (như tài khoản Admin) khi hệ thống được triển khai lần đầu tiên.

## 1. Mục tiêu
- Loại bỏ việc tạo tài khoản admin cứng trong code (`init_data.py`).
- Cung cấp giao diện web thân thiện để khởi tạo hệ thống.
- Đảm bảo an toàn: Chỉ cho phép cài đặt khi hệ thống chưa có tài khoản quản trị.

## 2. Thiết kế Database Setting (Mở rộng)
Để tránh hardcode, chúng ta sử dụng bảng `settings` theo cấu trúc Key-Value:
- **Table Name**: `settings`
- **Fields**:
    - `key` (String, Unique): Mã định danh cấu hình.
    - `value` (Text): Giá trị cấu hình (Lưu chuỗi hoặc JSON).
    - `type` (String): Loại dữ liệu (string, boolean, number, json) để frontend render input phù hợp.
    - `description` (String): Mô tả cấu hình.

## 3. Các thành phần cần thực hiện

### A. Backend (FastAPI)
- **Model & Migration**: Tạo model `Setting` và migrate vào database.
- **Endpoint Kiểm tra (`GET /api/v1/install/check`)**:
    - Kiểm tra xem đã có admin (`rank=0`) và cấu hình `system_installed` chưa.
- **Endpoint Thực hiện Cài đặt (`POST /api/v1/install/setup`)**:
    - Nhận: Thông tin Admin và các Setting cơ bản (Tên web, v.v.).
    - Thực hiện: Tạo Admin + Lưu các bản ghi vào bảng `settings`.

### B. Frontend (Next.js)
- **Trang Cài đặt (`/install`)**:
    - Form 1: Thông tin Website (lưu vào bảng `settings`).
    - Form 2: Thông tin tài khoản Quản trị (lưu vào bảng `members`).

## 4. Danh sách công việc (Checklist)

### Giai đoạn 1: Backend
- [x] Tạo router `install.py` trong `backend/app/api/api_v1/endpoints/`.
- [x] Đăng ký router mới vào `backend/app/api/api_v1/api.py`.
- [x] Cập nhật `backend/init_data.py` để không tự động tạo admin mặc định (chỉ tạo bảng).
- [x] Tạo model `Setting` và migrate vào database.

### Giai đoạn 2: Frontend
- [x] Tạo trang `frontend/src/app/install/page.tsx`.
- [x] Xây dựng form cài đặt với Tailwind CSS.
- [x] Kết nối API backend để thực hiện cài đặt.

### Giai đoạn 3: Kiểm tra và Bảo mật
- [x] Kiểm tra việc chặn truy cập `/install` sau khi đã có admin.
- [x] Kiểm tra luồng đăng nhập sau khi cài đặt thành công.

## 5. Kết quả thực hiện
- Toàn bộ module Install đã được triển khai thành công.
- Hệ thống hiện tại sẽ yêu cầu cài đặt khi lần đầu chạy nếu chưa có tài khoản Admin.
- Dữ liệu cấu hình được lưu trữ linh hoạt trong bảng `settings`.
