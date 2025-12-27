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

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính, tự động tăng. |
| `email` | String(255) | Email người dùng (Unique, Index). |
| `full_name` | String(255) | Họ tên đầy đủ (Nullable). |
| `hashed_password` | String | Mật khẩu đã được hash bằng bcrypt. |
| `is_active` | Boolean | Trạng thái hoạt động (Mặc định: True). |
| `rank` | Integer | Cấp bậc phân quyền (0-5, Mặc định: 5). |
| `created_at` | DateTime | Thời điểm tạo tài khoản (Auto). |
| `updated_at` | DateTime | Thời điểm cập nhật cuối (Auto). |

**Quy tắc Rank:**
- `0`: Super Admin - Toàn quyền
- `1-4`: Admin/Moderator - Có quyền truy cập Dashboard
- `5`: Member - Chỉ quản lý thông tin cá nhân
  
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
| `key` | String(255) | Khóa định danh cấu hình (Khóa chính, Duy nhất). |
| `value` | Text | Giá trị cấu hình (Có thể lưu chuỗi hoặc JSON). |
| `type` | String(50) | Kiểu dữ liệu (string, boolean, number, json). |
| `description` | Text | Mô tả tác dụng của cấu hình (Nullable). |
| `updated_at` | DateTime | Thời điểm cập nhật cuối cùng (Auto). |

**Các Settings Keys chính:**

**SEO Settings:**
- `site_title`: Tiêu đề trang web
- `site_description`: Mô tả SEO
- `site_keywords`: Từ khóa SEO
- `og_image`: URL ảnh Open Graph

**Branding:**
- `site_logo`: URL logo trang web
- `site_logo_text`: Text logo (fallback)

**Theme Settings:**
- `theme_base_style`: Base theme (neutral, red, blue, green, violet, orange, yellow, rose)
- `theme_primary_color`: Màu tùy chỉnh (OKLCH values)
- `theme_radius`: Độ bo góc (rem)

**Custom Scripts:**
- `header_scripts`: Scripts chèn vào `<head>`
- `body_scripts`: Scripts chèn vào `<body>`

---

## 3. Indexes và Performance
Các index được tạo để tối ưu truy vấn:
- `member.email`: Index duy nhất (Unique) cho việc login và lookup nhanh.
- `tokenblacklist.jti`: Index duy nhất cho việc kiểm tra token blacklist.
- `tokenblacklist.expires_at`: Index cho việc dọn dẹp token hết hạn.
- `setting.key`: Primary key, tự động có index.

## 4. Quản lý Database (pgAdmin)
Hệ thống tự động tích hợp pgAdmin để quản trị cơ sở dữ liệu:
- **Tự động đăng ký Server**: Sau khi cài đặt, hệ thống tự động đăng ký 2 kết nối vào pgAdmin:
    - **App DB**: Kết nối bằng tài khoản người dùng của ứng dụng (quyền hạn chế).
    - **Root Access**: Kết nối bằng tài khoản `postgres` (quyền quản trị cao nhất).
- **Đồng bộ tài khoản**: Tài khoản đăng nhập pgAdmin được đồng bộ với tài khoản Admin được tạo trong quá trình cài đặt.
- **Truy cập**: http://localhost:5050

---

## 5. Migration với Alembic
Hệ thống sử dụng Alembic để quản lý database schema changes:
- **Auto-generate migrations**: `alembic revision --autogenerate -m "description"`
- **Apply migrations**: `alembic upgrade head`
- **Rollback**: `alembic downgrade -1`
- **Migration files**: Được lưu trong `backend/alembic/versions/`

**Lưu ý:**
- Luôn review migration files trước khi apply
- Test migrations trên môi trường development trước
- Backup database trước khi chạy migrations quan trọng

## 6. Quy tắc thiết kế
- **Tên bảng**: Sử dụng danh từ số ít, viết thường (ví dụ: `member`, `setting`).
- **Khóa chính**: Luôn luôn có cột `id` kiểu Integer (auto-increment).
- **Thời gian**: Bổ sung các cột `created_at` và `updated_at` cho các bảng nghiệp vụ (sử dụng `TimestampMixin`).
- **Xóa mềm**: Cân nhắc sử dụng cột `is_deleted` hoặc `is_active` thay vì xóa vật lý.
- **Email**: Luôn unique và có index cho performance.
- **Text fields**: Sử dụng `Text` thay vì `String` cho nội dung dài (descriptions, scripts).

## 7. Backup và Restore
Sử dụng PostgreSQL tools để backup:

```bash
# Backup
docker exec postgres_db pg_dump -U postgres app_db > backup.sql

# Restore
docker exec -i postgres_db psql -U postgres app_db < backup.sql
```

Hoặc sử dụng pgAdmin interface để backup/restore với giao diện đồ họa.
