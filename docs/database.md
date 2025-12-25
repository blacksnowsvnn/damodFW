# Cấu trúc Cơ sở dữ liệu (damodFW)

[← Quay lại mục lục](README.md)

Tài liệu này mô tả cấu trúc các bảng trong cơ sở dữ liệu PostgreSQL của dự án **damodFW**.

## 1. Tổng quan
- **Hệ quản trị CSDL**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Công cụ di cư (Migration)**: Alembic

## 2. Danh sách các bảng

### Mixin chung: `TimestampMixin`
Tất cả các bảng nghiệp vụ đều kế thừa từ `TimestampMixin` để tự động quản lý thời gian:
- `created_at`: Thời điểm tạo bản ghi (tự động).
- `updated_at`: Thời điểm cập nhật bản ghi cuối cùng (tự động).

### Bảng `member` (Thành viên)
Lưu trữ thông tin người dùng và phân quyền.
- Kế thừa: `Base`, `TimestampMixin`
- Các cột cơ bản: `id`, `email`, `full_name`, `hashed_password`, `is_active`, `rank`.
  
---

### Bảng `tokenblacklist` (Danh sách đen Token)
Lưu trữ các token đã bị vô hiệu hóa sau khi người dùng đăng xuất.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính, tự động tăng. |
| `token` | String | Nội dung token đã bị vô hiệu hóa (Duy nhất). |
| `jti` | String | JWT ID (Mã định danh duy nhất của token). |
| `blacklisted_on` | DateTime | Thời điểm token bị đưa vào danh sách đen. |
| `expires_at` | DateTime | Thời điểm token hết hạn (Dùng để dọn dẹp DB sau này). |
  
---

### Bảng `setting` (Cấu hình hệ thống)
Lưu trữ các cấu hình linh hoạt của website dưới dạng Key-Value.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `key` | String | Khóa định danh cấu hình (Khóa chính, Duy nhất). |
| `value` | Text | Giá trị cấu hình (Có thể lưu chuỗi hoặc JSON). |
| `type` | String | Kiểu dữ liệu (string, boolean, number, json). |
| `description` | String | Mô tả tác dụng của cấu hình. |
| `updated_at` | DateTime | Thời điểm cập nhật cuối cùng. |

---

## 3. Quản lý Database (pgAdmin)
Hệ thống tự động tích hợp pgAdmin để quản trị cơ sở dữ liệu:
- **Tự động đăng ký Server**: Sau khi cài đặt, hệ thống tự động đăng ký 2 kết nối vào pgAdmin:
    - **App DB**: Kết nối bằng tài khoản người dùng của ứng dụng (quyền hạn chế).
    - **Root Access**: Kết nối bằng tài khoản `postgres` (quyền quản trị cao nhất).
- **Đồng bộ tài khoản**: Tài khoản đăng nhập pgAdmin được đồng bộ với tài khoản Admin được tạo trong quá trình cài đặt.

---

## 4. Quy tắc thiết kế
- **Tên bảng**: Sử dụng danh từ số ít, viết thường (ví dụ: `member`, `post`).
- **Khóa chính**: Luôn luôn có cột `id` kiểu Integer hoặc UUID.
- **Thời gian**: Nên bổ sung các cột `created_at` và `updated_at` cho các bảng nghiệp vụ trong tương lai.
- **Xóa mềm**: Cân nhắc sử dụng cột `is_deleted` thay vì xóa vật lý dữ liệu quan trọng.
