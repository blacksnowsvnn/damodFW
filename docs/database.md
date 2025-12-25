# Cấu trúc Cơ sở dữ liệu (damodFW)

Tài liệu này mô tả cấu trúc các bảng trong cơ sở dữ liệu PostgreSQL của dự án **damodFW**.

## 1. Tổng quan
- **Hệ quản trị CSDL**: PostgreSQL
- **ORM**: SQLAlchemy (với SQLModel hoặc Declarative Base)
- **Công cụ di cư (Migration)**: Alembic (dự kiến)

---

## 2. Danh sách các bảng

### Bảng `member` (Thành viên)
Lưu trữ thông tin người dùng và phân quyền.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính, tự động tăng. |
| `email` | String | Email người dùng (Duy nhất, dùng để đăng nhập). |
| `full_name` | String | Họ và tên đầy đủ. |
| `hashed_password` | String | Mật khẩu đã được mã hóa (Bcrypt). |
| `is_active` | Boolean | Trạng thái hoạt động (Mặc định: `true`). |
| `rank` | Integer | Cấp bậc (0: Admin, 1-5: Member - số càng nhỏ quyền càng cao). |
  
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
- **Tên bảng**: Sử dụng danh từ số ít, viết thường (ví dụ: `member`, `post`).
- **Khóa chính**: Luôn luôn có cột `id` kiểu Integer hoặc UUID.
- **Thời gian**: Nên bổ sung các cột `created_at` và `updated_at` cho các bảng nghiệp vụ trong tương lai.
- **Xóa mềm**: Cân nhắc sử dụng cột `is_deleted` thay vì xóa vật lý dữ liệu quan trọng.
