# Tài liệu API Endpoints (damodFW)

[← Quay lại mục lục](README.md)

Tài liệu này mô tả chi tiết các điểm cuối (endpoints) hiện có trong hệ thống Backend FastAPI của **damodFW**.

## 1. Thông tin chung
- **Base URL**: `http://yourdomain.com/api/v1`
- **API Documentation**: `http://yourdomain.com/api/v1/docs` (Swagger UI)
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

## 5. Nhóm Settings (Cài đặt hệ thống)
Quản lý các cấu hình toàn cục của hệ thống như SEO, Theme, và Custom Scripts.

### Lấy cài đặt công khai
- **Endpoint**: `GET /settings/public`
- **Quyền**: Công khai (không cần đăng nhập)
- **Mô tả**: Lấy các cấu hình công khai như SEO metadata, theme settings, và custom scripts để render trên frontend.
- **Trả về**: Object chứa các key-value pairs của settings công khai:
  ```json
  {
    "site_title": "DamodFW",
    "site_description": "Hệ thống quản lý thành viên",
    "site_keywords": "damod, framework, member management",
    "og_image": "/uploads/og-image.jpg",
    "theme_primary_color": "",
    "theme_radius": "0.625",
    "theme_base_style": "orange",
    "header_scripts": "<script>...</script>",
    "body_scripts": "<script>...</script>",
    "site_logo": "/uploads/logo.png",
    "site_logo_text": "DamodFW"
  }
  ```

### Lấy tất cả cài đặt
- **Endpoint**: `GET /settings/`
- **Quyền**: **Chỉ Admin (Rank < 5)**
- **Mô tả**: Lấy toàn bộ danh sách settings trong hệ thống.
- **Query Parameters**:
  - `skip`: Số bản ghi bỏ qua (mặc định: 0)
  - `limit`: Số bản ghi tối đa (mặc định: 100)
- **Trả về**: Array of settings objects.

### Lấy cài đặt theo key
- **Endpoint**: `GET /settings/{key}`
- **Quyền**: **Chỉ Admin (Rank < 5)**
- **Mô tả**: Lấy một setting cụ thể theo key.
- **Trả về**: Setting object hoặc lỗi 404 nếu không tìm thấy.

### Cập nhật nhiều cài đặt cùng lúc
- **Endpoint**: `PUT /settings/bulk`
- **Quyền**: **Chỉ Admin (Rank < 5)**
- **Mô tả**: Cập nhật hoặc tạo mới nhiều settings cùng lúc.
- **Body (JSON)**:
  ```json
  {
    "settings": {
      "site_title": "My Website",
      "theme_base_style": "blue",
      "theme_radius": "0.75"
    }
  }
  ```
- **Trả về**: Thông báo thành công.

### Các Settings Keys hỗ trợ:

#### SEO Settings:
- `site_title`: Tiêu đề trang web
- `site_description`: Mô tả trang web
- `site_keywords`: Từ khóa SEO
- `og_image`: Ảnh Open Graph cho social sharing

#### Branding Settings:
- `site_logo`: URL của logo trang web
- `site_logo_text`: Text logo (fallback khi không có logo ảnh)

#### Theme Settings:
- `theme_base_style`: Phong cách màu sắc cơ bản (`neutral`, `red`, `blue`, `green`, `violet`, `orange`, `yellow`, `rose`)
- `theme_primary_color`: Màu chủ đạo tùy chỉnh (OKLCH values, ví dụ: `0.623 0.214 259.815`)
- `theme_radius`: Độ bo góc (giá trị rem, ví dụ: `0.625`)

#### Custom Scripts:
- `header_scripts`: Scripts tùy chỉnh chèn vào `<head>`
- `body_scripts`: Scripts tùy chỉnh chèn trước `</body>`

---

## 6. Nhóm Upload (Tải file lên)
Quản lý việc upload file như logo, favicon, images.

### Upload file
- **Endpoint**: `POST /upload`
- **Quyền**: **Chỉ Admin (Rank < 5)**
- **Mô tả**: Upload một file lên server.
- **Body**: `multipart/form-data`
  - `file`: File cần upload
- **Trả về**: 
  ```json
  {
    "url": "/uploads/filename.jpg"
  }
  ```
- **Lưu ý**: 
  - File được lưu vào thư mục `/app/uploads` trong container backend
  - Có thể truy cập qua URL `/uploads/filename.jpg`
  - Hỗ trợ các định dạng: `jpg`, `jpeg`, `png`, `gif`, `svg`, `webp`, `ico`

---

## 7. Hệ thống phân quyền (Rank System)
- **Rank 0**: Super Admin - Toàn quyền điều khiển hệ thống.
- **Rank 1-4**: Admin/Moderator - Có quyền truy cập Dashboard và một số chức năng quản trị.
- **Rank 5**: Member - Quyền hạn chế, chỉ quản lý được thông tin cá nhân.
- *Quy tắc*: 
  - Rank số càng nhỏ thì quyền hạn càng cao.
  - API check quyền Dashboard: `rank < 5` (tức rank từ 0-4 có quyền truy cập).
  - Chỉ Rank 0 mới có quyền tạo/xóa thành viên và thay đổi rank của người khác.

---

## 8. Xử lý lỗi (Error Handling)

### Mã lỗi phổ biến:
- **400 Bad Request**: Dữ liệu request không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc token không hợp lệ
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Không tìm thấy resource
- **422 Unprocessable Entity**: Validation error (Pydantic)
- **500 Internal Server Error**: Lỗi server

### Format lỗi chuẩn:
```json
{
  "detail": "Error message here"
}
```

---

## 9. Ghi chú bảo mật

### Token Blacklist:
- Khi logout, access token sẽ được thêm vào blacklist
- Token trong blacklist không thể sử dụng để truy cập API
- Blacklist được lưu trong bảng `token_blacklist`

### Password Hashing:
- Mật khẩu được hash bằng bcrypt
- Không bao giờ lưu plain text password

### Validation:
- Tất cả input đều được validate qua Pydantic schemas
- Email phải đúng định dạng
- Password có độ dài tối thiểu

### Custom Scripts Safety:
- Custom scripts trong settings được lưu trữ as-is
- Admin chịu trách nhiệm đảm bảo scripts an toàn
- Chỉ Admin có quyền chỉnh sửa scripts
