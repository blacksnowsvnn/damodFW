# Quy chuẩn phát triển (Development Guidelines)

[← Quay lại mục lục](README.md)

Tài liệu này quy định các tiêu chuẩn và quy trình phát triển để đảm bảo mã nguồn của **damodFW** luôn sạch sẽ, dễ bảo trì và nhất quán.

## 1. Nguyên tắc cốt lõi (Core Principles)

Tuân thủ các nguyên tắc sau trong mọi tình huống:
1.  **Ngắn gọn và Súc tích**: Ưu tiên viết mã ngắn gọn nhưng rõ ràng.
2.  **Dễ hiểu sau 6 tháng**: Viết mã để chính bạn và người khác có thể hiểu ngay khi đọc lại sau này.
3.  **Viết cho con người**: Ưu tiên sự rõ ràng, đặt tên biến/hàm có ý nghĩa.
4.  **Tự giải thích (Self-documenting)**: Mã nguồn nên tự giải thích logic. Chỉ comment cho những phần thực sự phức tạp.
5.  **Ngôn ngữ**: Sử dụng **tiếng Việt** trong comment và docstring.

## 2. Quy chuẩn Frontend (Next.js)

- **UI Components**: Luôn ưu tiên sử dụng các component từ **shadcn/ui**. Chỉ viết component tùy chỉnh khi không có component phù hợp.
- **Styling**: Sử dụng **Tailwind CSS v4**. Hạn chế viết CSS thuần.
- **State Management**: Sử dụng React Hooks (useState, useEffect) hoặc các giải pháp gọn nhẹ nếu cần.
- **API Calls**: Sử dụng helper tại `src/lib/api.ts` để thực hiện các yêu cầu HTTP.

## 3. Quy chuẩn Backend (FastAPI)

- **Validation**: 100% API Endpoints phải sử dụng **Pydantic v2 schemas** để validate dữ liệu đầu vào và đầu ra.
- **Type Hinting**: Sử dụng type hinting đầy đủ cho tất cả các hàm và biến.
- **Dependency Injection**: Sử dụng hệ thống `Depends` của FastAPI để quản lý database session, authentication, v.v.
- **ORM**: Sử dụng **SQLAlchemy 2.0** với cú pháp `select()`, `execute()`. Tránh sử dụng cú pháp 1.x cũ.
- **Migrations**: Mọi thay đổi về schema database phải được thực hiện thông qua **Alembic**.

## 4. Làm việc với Docker

Dự án chạy hoàn toàn trong Docker. Cần lưu ý:
- **Cài đặt thư viện mới**:
    - **Frontend**: Chạy `npm install` trên máy host VÀ `docker exec nextjs_app npm install [tên-gói]`.
    - **Backend**: Cập nhật `requirements.txt` và chạy `docker compose build backend`.
- **Đường dẫn CSS**: Trong CSS, sử dụng đường dẫn tương đối trỏ thẳng vào `node_modules` (ví dụ: `@plugin "../../node_modules/tailwindcss-animate"`) để tránh lỗi với Turbopack trong Docker.
- **Logs**: Luôn kiểm tra logs bằng `docker logs -f [container_name]` khi gặp lỗi.

## 5. Quy trình Git

- **Branching**: Sử dụng `main` cho production, `develop` cho môi trường phát triển (nếu có).
- **Commit Message**: Viết commit message rõ ràng, súc tích (ví dụ: `feat: add login api`, `fix: database connection error`).
- **Pull Requests**: Yêu cầu review trước khi merge vào các nhánh chính.

## 6. Kiểm thử (Testing)

- **Pytest**: Luôn chạy `pytest` trước khi commit các thay đổi lớn ở Backend.
- **Coverage**: Cố gắng duy trì độ bao phủ (coverage) mã nguồn ở mức cao.
- **Test Data**: Sử dụng database test riêng biệt (đã được cấu hình trong `conftest.py`).

---

*Lưu ý: Mọi vi phạm quy chuẩn cần được giải trình và sửa đổi kịp thời để đảm bảo chất lượng dự án.*
