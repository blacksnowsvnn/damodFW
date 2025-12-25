# Tài liệu Dự án Damod

Chào mừng bạn đến với tài liệu kỹ thuật của dự án **Damod**. Dự án này là một ứng dụng full-stack sử dụng các công nghệ hiện đại, được đóng gói bằng Docker để dễ dàng triển khai và quản lý.

## Mục lục

1. [Hướng dẫn cài đặt (setup.md)](docs/setup.md)
2. [Kiến trúc hệ thống (architecture.md)](docs/architecture.md)
3. [Tài liệu API (api_endpoints.md)](docs/api_endpoints.md)
4. [Cấu trúc Cơ sở dữ liệu (database.md)](docs/database.md)
5. [Cấu hình biến môi trường (environment.md)](docs/environment.md)

## Tổng quan công nghệ

Dự án bao gồm 3 thành phần chính:

- **Frontend**: Ứng dụng Next.js (React) chạy tại cổng `3000`.
- **Backend**: API FastAPI (Python) chạy tại cổng `8000`.
- **Proxy**: Nginx đóng vai trò là reverse proxy, điều hướng traffic và quản lý tên miền của dự án.

## Cấu trúc thư mục chính

```text
.
├── backend/            # Mã nguồn FastAPI
├── frontend/           # Mã nguồn Next.js
├── nginx/              # Cấu hình Nginx
├── docs/               # Tài liệu dự án
├── docker-compose.yml  # File điều phối container
└── .env                # Biến môi trường
```
