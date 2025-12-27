# Quy chuẩn phát triển (Development Guidelines)

[← Quay lại mục lục](README.md)

Tài liệu này quy định các tiêu chuẩn và quy trình phát triển để đảm bảo mã nguồn của **damodFW** luôn sạch sẽ, dễ bảo trì và nhất quán.

## 1. Nguyên tắc cốt lõi (Core Principles)

Tuân thủ các nguyên tắc sau trong mọi tình huống:
1.  **Ngắn gọn và Súc tích**: Ưu tiên viết mã ngắn gọn nhưng rõ ràng.
2.  **Dễ hiểu sau 6 tháng**: Viết mã để chính bạn và người khác có thể hiểu ngay khi đọc lại sau này.
3.  **Viết cho con người**: Ưu tiên sự rõ ràng, đặt tên biến/hàm có ý nghĩa.
4.  **Tự giải thích (Self-documenting)**: Mã nguồn nên tự giải thích logic. Chỉ comment cho những phần thực sự phức tạp.
5.  **Ngôn ngữ**: Sử dụng **tiếng Việt có dấu** trong tất cả comment và docstring.
6.  **No Manual Backups**: Tin tưởng vào Git, không tạo file backup thủ công (.old, .bak, .backup).
7.  **Minimal Documentation**: Tập trung vào inline comments và code quality thay vì external docs dài dòng.

## 2. Quy chuẩn Frontend (Next.js)

### 2.1. UI Components và Styling
- **UI Components**: Luôn ưu tiên sử dụng các component từ **shadcn/ui**. Chỉ viết component tùy chỉnh khi không có component phù hợp.
- **Styling**: 
  - Sử dụng **Tailwind CSS v4** cho tất cả styling.
  - **BẮT BUỘC**: Sử dụng `cn()` utility từ `@/lib/utils` cho TẤT CẢ className (kể cả static classes).
  - **KHÔNG** sử dụng template literals hoặc string concatenation cho className.
  - **KHÔNG** hardcode colors - luôn dùng design tokens (bg-primary, text-foreground, etc).
  
```typescript
// ✅ ĐÚNG
import { cn } from "@/lib/utils"
<div className={cn("container", active && "active")}>

// ❌ SAI
<div className="container">
<div className={`flex ${active ? "active" : ""}`}>
```

### 2.2. TypeScript
- **Strict Mode**: Luôn bật TypeScript strict mode, zero tolerance cho `any`.
- **Type Definitions**: Định nghĩa interfaces/types cho tất cả props và data structures.
- **Naming**:
  - PascalCase: Types, Interfaces, Components
  - camelCase: Variables, Functions
  - UPPER_SNAKE_CASE: Constants

### 2.3. Comments và Documentation
- **Comments**: TẤT CẢ comments phải bằng **Tiếng Việt có dấu**.
- **JSDoc**: Sử dụng JSDoc cho exported functions và components phức tạp.
- **Inline Comments**: Ưu tiên inline comments thay vì external documentation.

```typescript
// ✅ ĐÚNG
// Tính tổng giá trị đơn hàng

// ❌ SAI
// Calculate total order value
```

### 2.4. State Management và API
- **State Management**: Sử dụng React Hooks (useState, useEffect) hoặc các giải pháp gọn nhẹ nếu cần.
- **API Calls**: Sử dụng helper tại `src/lib/api.ts` để thực hiện các yêu cầu HTTP.
- **Error Handling**: Luôn handle errors và hiển thị toast notifications cho user feedback.

### 2.5. Import Order
Sắp xếp imports theo thứ tự:
1. React & Next.js
2. External libraries
3. Internal utilities (`@/lib`)
4. Components (`@/components`)
5. Types (`@/types`)

### 2.6. Orange Theme Guidelines
- **Primary Colors**: Sử dụng theme orange làm màu chủ đạo.
- **Design Tokens**:
  ```typescript
  // Backgrounds
  "bg-primary"           // Orange
  "bg-primary/90"        // Hover
  "bg-primary/10"        // Subtle
  
  // Text
  "text-primary"
  "text-primary-foreground"
  
  // Borders & Focus
  "border-primary"
  "ring-primary"
  ```
- **Semantic Colors**: Chỉ sử dụng màu khác cho semantic purposes (success: green, error: destructive, warning: amber).

## 3. Quy chuẩn Backend (FastAPI)

### 3.1. API Design
- **Validation**: 100% API Endpoints phải sử dụng **Pydantic v2 schemas** để validate dữ liệu đầu vào và đầu ra.
- **Type Hinting**: Sử dụng type hinting đầy đủ cho tất cả các hàm và biến.
- **Dependency Injection**: Sử dụng hệ thống `Depends` của FastAPI để quản lý database session, authentication, v.v.
- **Response Models**: Luôn định nghĩa `response_model` cho endpoints để ensure type safety.

### 3.2. Database
- **ORM**: Sử dụng **SQLAlchemy 2.0** với cú pháp `select()`, `execute()`. Tránh sử dụng cú pháp 1.x cũ.
- **Migrations**: Mọi thay đổi về schema database phải được thực hiện thông qua **Alembic**.
- **CRUD Pattern**: Sử dụng pattern CRUD trong `app/crud/` cho tất cả database operations.
- **Transactions**: Sử dụng database transactions cho operations phức tạp.

### 3.3. Comments và Documentation
- **Comments**: TẤT CẢ comments và docstrings phải bằng **Tiếng Việt có dấu**.
- **API Docs**: FastAPI tự động generate Swagger docs từ docstrings và type hints.
- **Error Messages**: Error messages trả về cho client nên rõ ràng và hữu ích.

```python
# ✅ ĐÚNG
def get_member(db: Session, member_id: int) -> Member:
    """
    Lấy thông tin thành viên theo ID.
    
    Args:
        db: Database session
        member_id: ID của thành viên
        
    Returns:
        Member object hoặc None nếu không tìm thấy
    """
    
# ❌ SAI
def get_member(db: Session, member_id: int) -> Member:
    """Get member by ID"""
```

### 3.4. Security
- **Password Hashing**: Luôn hash passwords với bcrypt, không bao giờ lưu plain text.
- **Token Blacklist**: Implement token blacklist cho logout functionality.
- **Input Sanitization**: Pydantic đã handle validation, nhưng cẩn thận với SQL injection.
- **Error Handling**: Không expose sensitive information trong error messages.

## 4. Làm việc với Docker

Dự án chạy hoàn toàn trong Docker. Cần lưu ý:

### 4.1. Cài đặt thư viện mới
- **Frontend**: 
  ```bash
  # Cài trên host
  npm install [package-name]
  
  # Cài trong container
  docker exec nextjs_app npm install [package-name]
  ```
  
- **Backend**: 
  ```bash
  # Cập nhật requirements.txt
  echo "package-name==version" >> backend/requirements.txt
  
  # Rebuild container
  docker compose build backend
  docker compose up -d backend
  ```

### 4.2. Container Management
- **Logs**: `docker logs -f [container_name]` hoặc `docker compose logs -f [service]`
- **Exec**: `docker exec -it [container_name] bash`
- **Restart**: `docker compose restart [service]`
- **Rebuild**: `docker compose build [service]`

### 4.3. Debugging
- **Frontend**: Check logs tại `docker logs nextjs_app`
- **Backend**: Check logs tại `docker logs fastapi_app`
- **Database**: Connect qua pgAdmin tại `http://localhost:5050`
- **Network**: Containers communicate qua service names (backend, frontend, db)

### 4.4. Special Notes
- **CSS Paths**: Trong CSS, sử dụng đường dẫn tương đối trỏ thẳng vào `node_modules` (ví dụ: `@plugin "../../node_modules/tailwindcss-animate"`) để tránh lỗi với Turbopack trong Docker.
- **File Uploads**: Uploads được share giữa backend và frontend qua mounted volume `./backend/uploads`.

## 5. Quy trình Git

### 5.1. Branching Strategy
- **main**: Production-ready code
- **develop**: Development branch (nếu có)
- **feature/**: Feature branches (feature/user-dashboard)
- **fix/**: Bug fix branches (fix/login-error)

### 5.2. Commit Messages
Sử dụng Conventional Commits format:
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add theme settings page
fix: resolve border radius not updating
docs: update API endpoints documentation
refactor: improve theme injection logic
```

### 5.3. Best Practices
- **Small Commits**: Commit often với changes nhỏ, focused.
- **Meaningful Messages**: Commit messages nên mô tả "what" và "why", không chỉ "what".
- **Pull Requests**: Yêu cầu review trước khi merge vào các nhánh chính.
- **No Backup Files**: KHÔNG commit các file backup (.old, .bak, .backup).
- **Clean History**: Sử dụng `git rebase` để maintain clean history nếu cần.

## 6. Kiểm thử (Testing)

### 6.1. Backend Testing
- **Pytest**: Luôn chạy `pytest` trước khi commit các thay đổi lớn.
- **Coverage**: Cố gắng duy trì độ bao phủ (coverage) mã nguồn ở mức cao (>80%).
- **Test Data**: Sử dụng database test riêng biệt (đã được cấu hình trong `conftest.py`).
- **Test Structure**: Organize tests theo structure: `tests/api/`, `tests/crud/`.

```bash
# Chạy tất cả tests
docker exec fastapi_app pytest

# Chạy với coverage
docker exec fastapi_app pytest --cov=app

# Chạy specific test file
docker exec fastapi_app pytest tests/api/test_auth.py
```

### 6.2. Frontend Testing
- **Manual Testing**: Test UI changes trên browser trước khi commit.
- **ESLint**: Chạy `npm run lint` để check code quality.
- **TypeScript**: Đảm bảo không có TypeScript errors.

```bash
# Lint check
docker exec nextjs_app npm run lint

# Type check
docker exec nextjs_app npm run type-check
```

## 7. File Management Rules

### 7.1. TRÁNH TẠO
- ❌ README files dài dòng cho mỗi feature nhỏ
- ❌ Multiple summary files (SUMMARY.md, OVERVIEW.md)
- ❌ Backup files (.old.md, .bak.md, .backup)
- ❌ Comparison reports (BEFORE_AFTER.md)
- ❌ Changelog files cho changes nhỏ
- ❌ Manual backup files của code (.tsx.old, .py.backup)

### 7.2. CHỈ TẠO KHI
- ✅ User yêu cầu cụ thể
- ✅ Setup/Installation guide cho project lớn
- ✅ API documentation cho public libraries
- ✅ Architecture decisions cho breaking changes

### 7.3. BEST PRACTICE
- ✅ Viết comments chi tiết trong code thay vì external docs
- ✅ Dùng JSDoc/docstrings cho functions/components
- ✅ README ngắn gọn, to the point
- ✅ Inline documentation > External files
- ✅ Trust Git cho versioning, không manual backup

## 8. Code Style Checklist

### Pre-Commit Checklist:
- [ ] Comments Tiếng Việt có dấu ✅
- [ ] cn() cho TẤT CẢ className (Frontend) ✅
- [ ] TypeScript strict, no `any` ✅
- [ ] Design tokens thay vì hardcode colors ✅
- [ ] No console.log trong production code ✅
- [ ] ESLint clean ✅
- [ ] No unnecessary .md files ✅
- [ ] No backup files (.old, .bak) ✅
- [ ] Meaningful commit message ✅

### Common Pitfalls (Tránh):
- ❌ Comments Tiếng Anh
- ❌ Không dùng cn() cho className
- ❌ Hardcode colors (bg-blue-500, #fff)
- ❌ `any` types trong TypeScript
- ❌ console.log trong production
- ❌ Inline styles
- ❌ Tạo nhiều .md files không cần thiết
- ❌ Manual backup files
- ❌ Verbose documentation

---

## 9. Tech Stack Reference

### Frontend:
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4+
- **UI Components**: Shadcn UI + Radix UI
- **Icons**: Lucide React
- **HTTP Client**: Custom apiRequest wrapper

### Backend:
- **Framework**: FastAPI 0.100+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Migration**: Alembic
- **Database**: PostgreSQL 15

### DevOps:
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Database Admin**: pgAdmin 4

---

*Lưu ý: Mọi vi phạm quy chuẩn cần được giải trình và sửa đổi kịp thời để đảm bảo chất lượng dự án. Golden Rules: cn() cho TẤT CẢ className, Tiếng Việt có dấu cho TẤT CẢ comments, Orange Theme, TypeScript strict, Clean code.*
