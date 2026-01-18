# Task Management Backend

Backend API chuyên nghiệp cho hệ thống quản lý công việc, cung cấp các tính năng quản lý workspace, board, task và hệ thống phân quyền RBAC linh hoạt.

## Mục lục

1.  [Giới thiệu](#giới-thiệu)
2.  [Công nghệ](#công-nghệ)
3.  [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
4.  [Hướng dẫn Setup cho Developer](#hướng-dẫn-setup-cho-developer)
5.  [Database & Migrations](#database--migrations)
6.  [Scripts](#scripts)
7.  [API Documentation](#api-documentation)
8.  [RBAC System](#rbac-system)

---

## Giới thiệu

Dự án được thiết kế theo kiến trúc hướng module (Modular Architecture), tối ưu hóa cho việc mở rộng và bảo trì. Hệ thống xử lý các nghiệp vụ cốt lõi của ứng dụng Task Management tương tự Trello, bao gồm xác thực nâng cao, quản lý trạng thái công việc và làm việc nhóm.

## Công nghệ

*   **Core**: Node.js (v18+), Express.js (v5.1+), TypeScript (v5.9+)
*   **Database**: PostgreSQL 17
*   **ORM**: TypeORM v0.3
*   **Authentication**: Passport.js (JWT, Google OAuth, Local Strategy)
*   **Validation**: Zod
*   **Log & Error Handling**: Custom Error Handler, Middleware centralized
*   **Environment**: Docker & Docker Compose

## Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo môi trường phát triển của bạn đáp ứng các yêu cầu sau:

*   Node.js >= 18.0.0
*   npm >= 9.0.0
*   Docker & Docker Compose (Khuyến nghị để chạy Database)
*   PostgreSQL 17 (Nếu cài đặt thủ công)

## Hướng dẫn Setup cho Developer

Quy trình chuẩn để setup dự án sau khi pull code về máy:

### 1. Khởi tạo dự án

```bash
# Clone repository
git clone <repository-url>
cd TaskManagement-BE

# Cài đặt các gói phụ thuộc
npm install
```

### 2. Cấu hình môi trường

Sao chép file cấu hình mẫu `.env.example` sang `.env`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường quan trọng trong file `.env`:

```ini
# App
PORT=2409

# Database Config (Tương thích với docker-compose.dev.yml)
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=TaskManagementDB

# Authentication
ACCESS_SECRET_KEY=...
REFRESH_SECRET_KEY=...

# OAuth & Mail (Optional cho dev local ban đầu)
GOOGLE_CLIENT_ID=...
SMTP_HOST=...
```

### 3. Khởi chạy Database

Sử dụng Docker để khởi tạo môi trường Database nhanh chóng:

```bash
# Khởi động PostgreSQL container
npm run docker:dev:up
```

*Lệnh này sẽ chạy docker-compose.dev.yml, expose port 5434 (như cấu hình mặc định) để tránh xung đột với Postgres mặc định trên máy.*

### 4. Chạy Migrations & Seed Data

Chạy migration để tạo cấu trúc bảng và tự động seed dữ liệu ban đầu (Roles & Permissions):

```bash
npm run migration:run
```

### 5. Khởi động Server

Chạy ứng dụng ở chế độ Development (Watch mode):

```bash
npm run dev
```

Server sẽ sẵn sàng tại: `http://localhost:2409`

## Database & Migrations

Quản lý thay đổi cấu trúc database thông qua TypeORM CLI.

*   **Tạo Migration mới (Từ thay đổi Entity):**
    ```bash
    npm run migration:generate src/common/migrations/MigrationName
    ```

*   **Tạo Migration rỗng:**
    ```bash
    npm run migration:create src/common/migrations/MigrationName
    ```

*   **Chạy Migration:**
    ```bash
    npm run migration:run
    ```

*   **Hoàn tác Migration (Rollback):**
    ```bash
    npm run migration:revert
    ```

## Scripts

Các lệnh script hữu ích trong `package.json`:

| Script | Mô tả |
| :--- | :--- |
| `npm run dev` | Chạy server chế độ development (watch mode) |
| `npm run build` | Build code TypeScript sang JavaScript |
| `npm start` | Chạy server production |
| `npm run test` | Chạy Unit Tests với Vitest |
| `npm run docker:dev:up` | Bật các containers development |
| `npm run docker:dev:down` | Tắt các containers development |

## API Documentation

Mọi endpoint đều được tài liệu hóa bằng OpenAPI (Swagger).
Truy cập giao diện Swagger UI tại:

👉 `http://localhost:2409/api-docs`

## RBAC System

Hệ thống phân quyền được chia thành 2 cấp độ:

### Workspace Scope
*   **workspace_owner**: Quyền cao nhất, quản lý toàn bộ workspace và billing.
*   **workspace_admin**: Quản lý thành viên và boards.
*   **workspace_member**: Quyền cơ bản, truy cập và làm việc trên các boards được gán.

### Board Scope
*   **board_owner**: Người tạo hoặc sở hữu board.
*   **board_admin**: Quản lý settings và thành viên trong board.
*   **board_member**: Thao tác tasks, lists trong board.

---
**Maintainer**: Nguyen Huu Nhat Huy
