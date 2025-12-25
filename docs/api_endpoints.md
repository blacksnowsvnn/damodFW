# Tài liệu API Endpoints (damodFW)

[← Quay lại mục lục](README.md)

Tài liệu này mô tả chi tiết các điểm cuối (endpoints) hiện có trong hệ thống Backend FastAPI của **damodFW**.

## 1. Thông tin chung
- **Base URL**: `http://yourdomain.com/backend/api/v1`
- **Định dạng dữ liệu**: JSON
- **Xác thực**: JWT (Bearer Token)
- **Validation**: 100% các request body và response body đều được validate nghiêm ngặt bằng **Pydantic v2 schemas**. Dữ liệu không khớp với định dạng yêu cầu sẽ bị từ chối với mã lỗi `422 Unprocessable Entity`.

---

## 2. Nhóm Auth (Xác thực)
Dùng cho việc đăng nhập, đăng ký và khôi phục tài khoản.

### Đăng nhập (Login)
- **Endpoint**: `POST /auth/login`
- **Mô tả**: Đăng nhập bằng email và mật khẩu để lấy Access Token.
- **Body (OAuth2 Form)**:
  - `username`: Email người dùng
  - `password`: Mật khẩu
- **Trả về**: `access_token`, `token_type`

### Đăng xuất (Logout)
- **Endpoint**: `POST /auth/logout`
- **Quyền**: Yêu cầu đăng nhập.
- **Mô tả**: Vô hiệu hóa Access Token hiện tại bằng cách thêm vào danh sách đen (Blacklist) ở Backend. Sau khi gọi thành công, token này sẽ không thể sử dụng để truy cập các API yêu cầu xác thực nữa.
- **Trả về**: Thông báo thành công (`msg`).

### Đăng ký công khai (Register)
- **Endpoint**: `POST /auth/register`
- **Mô tả**: Cho phép người dùng mới tự đăng ký tài khoản.
- **Body (JSON)**:
  - `email`: Email đăng ký (Bắt buộc)
  - `password`: Mật khẩu (Bắt buộc)
  - `full_name`: Họ tên (Tùy chọn)
- **Lưu ý**: Tài khoản mới đăng ký sẽ mặc định có **Rank 5** (Thành viên).

### Quên mật khẩu (Password Recovery)
- **Endpoint**: `POST /auth/password-recovery/{email}`
- **Mô tả**: Gửi yêu cầu khôi phục mật khẩu. Hiện tại chỉ kiểm tra email tồn tại và trả về thông báo.

---

## 3. Nhóm Members (Thành viên)
Quản lý thông tin và phân quyền người dùng.

### Lấy thông tin cá nhân (Get Me)
- **Endpoint**: `GET /members/me`
- **Quyền**: Yêu cầu đăng nhập.
- **Mô tả**: Trả về thông tin của người dùng đang đăng nhập.

### Xem danh sách thành viên
- **Endpoint**: `GET /members/`
- **Quyền**: **Chỉ Admin (Rank 0)**.
- **Mô tả**: Liệt kê danh sách tất cả thành viên trong hệ thống.

### Tạo thành viên mới (Admin)
- **Endpoint**: `POST /members/`
- **Quyền**: **Chỉ Admin (Rank 0)**.
- **Mô tả**: Admin tạo tài khoản cho người dùng khác và có thể tùy chỉnh Rank.
- **Body (JSON)**:
  - `email`: Email (Bắt buộc)
  - `password`: Mật khẩu (Bắt buộc)
  - `full_name`: Họ tên (Tùy chọn)
  - `rank`: Cấp bậc từ 0-5 (Mặc định 5)

### Xem chi tiết thành viên
- **Endpoint**: `GET /members/{member_id}`
- **Quyền**: Admin hoặc chính chủ sở hữu tài khoản.
- **Mô tả**: Xem thông tin chi tiết của một thành viên theo ID.

### Cập nhật thông tin thành viên
- **Endpoint**: `PUT /members/{member_id}`
- **Quyền**: Admin hoặc chính chủ sở hữu tài khoản.
- **Body (JSON - Tùy chọn các trường)**:
  - `email`: Email mới
  - `full_name`: Họ tên mới
  - `password`: Mật khẩu mới
  - `rank`: Cấp bậc mới (Chỉ Admin mới có quyền đổi)
  - `is_active`: Trạng thái hoạt động
- **Lưu ý quan trọng**: 
  - Người dùng bình thường không thể tự thay đổi Rank của mình.
  - Chỉ Admin mới có quyền thay đổi Rank của người khác.

### Xóa thành viên
- **Endpoint**: `DELETE /members/{member_id}`
- **Quyền**: **Chỉ Admin (Rank 0)**.
- **Mô tả**: Xóa hoàn toàn một thành viên khỏi hệ thống.

---

## 4. Nhóm Install (Cài đặt hệ thống)
Dùng để khởi tạo hệ thống khi lần đầu triển khai.

### Kiểm tra trạng thái cài đặt
- **Endpoint**: `GET /install/check`
- **Mô tả**: Kiểm tra xem hệ thống đã được cài đặt chưa (kiểm tra sự tồn tại của file `.env`).
- **Trả về**: `{"msg": "installed"}` hoặc `{"msg": "not_installed"}`.

### Kiểm tra kết nối Database
- **Endpoint**: `POST /install/test-db`
- **Mô tả**: Kiểm tra kết nối tới PostgreSQL với thông tin cung cấp trước khi tiến hành cài đặt chính thức.
- **Body (JSON)**:
    - `db_host`: Host của database (ví dụ: `db` hoặc `localhost`)
    - `db_port`: Port (mặc định `5432`)
    - `db_user`: Tên người dùng database
    - `db_password`: Mật khẩu database
    - `db_name`: Tên database
- **Trả về**: Thông báo thành công hoặc lỗi chung (thông tin nhạy cảm đã được ẩn).

### Thực hiện cài đặt hệ thống
- **Endpoint**: `POST /install/setup`
- **Mô tả**: Khởi tạo hệ thống bao gồm: Cập nhật file `.env`, cấu hình Nginx, reset và tạo bảng database, tạo tài khoản Admin đầu tiên, tự động cấu hình server trong pgAdmin.
- **Body (JSON)**:
    - `db_config`: Đối tượng chứa thông tin kết nối database
    - `domain_config`:
        - `app_name`: Tên ứng dụng (dùng làm tên server trong pgAdmin)
        - `domain`: Tên miền
    - `pgadmin_config`:
        - `pgadmin_email`: Email pgAdmin
        - `pgadmin_password`: Mật khẩu pgAdmin
    - `admin_email`: Email Admin
    - `admin_password`: Mật khẩu Admin
    - `admin_full_name`: Họ tên Admin
- **Trả về**: Thông báo thành công.
- **Lưu ý**: Các lỗi chi tiết được ghi vào logs server, API chỉ trả về thông báo lỗi chung để đảm bảo bảo mật.

---

## 5. Hệ thống phân quyền (Rank System)
- **Rank 0**: Admin - Toàn quyền điều khiển hệ thống.
- **Rank 1 - 5**: Member - Quyền hạn chế, chỉ quản lý được thông tin cá nhân.
- *Quy tắc*: Rank số càng nhỏ thì quyền hạn càng cao.
