# Task Management Backend

Professional backend API for a task management system, providing features for workspace, board, and task management, along with a flexible RBAC (Role-Based Access Control) system.

## Table of Contents

1.  [Introduction](#introduction)
2.  [Technologies](#technologies)
3.  [System Requirements](#system-requirements)
4.  [Setup Guide for Developers](#setup-guide-for-developers)
5.  [Database & Migrations](#database--migrations)
6.  [Scripts](#scripts)
7.  [API Documentation](#api-documentation)
8.  [RBAC System](#rbac-system)

---

## Introduction

This project is designed using Modular Architecture, optimized for scalability and maintenance. The system handles core business logic for a Task Management application similar to Trello, including advanced authentication, task status management, and team collaboration.

## Technologies

*   **Core**: Node.js (v18+), Express.js (v5.1+), TypeScript (v5.9+)
*   **Database**: PostgreSQL 17
*   **ORM**: TypeORM v0.3
*   **Authentication**: Passport.js (JWT, Google OAuth, Local Strategy)
*   **Validation**: Zod
*   **Log & Error Handling**: Custom Error Handler, Centralized Middleware
*   **Environment**: Docker & Docker Compose

## System Requirements

Before getting started, ensure your development environment meets the following requirements:

*   Node.js >= 18.0.0
*   pnpm >= 9.0.0
*   Docker & Docker Compose (Recommended for running the Database)
*   PostgreSQL 17 (If installed manually)

## Setup Guide for Developers

Standard procedure to set up the project after pulling the code:

### 1. Initialize Project

```bash
# Clone repository
git clone <repository-url>
cd TaskManagement-BE

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Copy the sample configuration file `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update critical environment variables in the `.env` file:

```ini
# App
PORT=2409

# Database Config (Compatible with docker-compose.dev.yml)
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=TaskManagementDB

# Authentication
ACCESS_SECRET_KEY=...
REFRESH_SECRET_KEY=...

# OAuth & Mail (Optional for initial local dev)
GOOGLE_CLIENT_ID=...
SMTP_HOST=...
```

### 3. Start Database

Use Docker to quickly initialize the Database environment:

```bash
# Start PostgreSQL container
pnpm docker:dev:up
```

*This command runs `docker-compose.dev.yml`, exposing port 5434 (as per default config) to avoid conflicts with the default Postgres on your machine.*

### 4. Run Migrations & Seed Data

Run migrations to create the table structure and automatically seed initial data (Roles & Permissions):

```bash
pnpm migration:run
```

### 5. Start Server

Run the application in Development mode (Watch mode):

```bash
pnpm dev
```

The server will be ready at: `http://localhost:2409`

## Database & Migrations

Manage database schema changes via TypeORM CLI.

*   **Create New Migration (From Entity changes):**
    ```bash
    pnpm migration:generate src/common/migrations/MigrationName
    ```

*   **Create Empty Migration:**
    ```bash
    pnpm migration:create src/common/migrations/MigrationName
    ```

*   **Run Migrations:**
    ```bash
    pnpm migration:run
    ```

*   **Revert Migration:**
    ```bash
    pnpm migration:revert
    ```

## Scripts

Useful script commands in `package.json`:

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Run server in development mode (watch mode) |
| `pnpm build` | Build TypeScript code to JavaScript |
| `pnpm start` | Run production server |
| `pnpm test` | Run Unit Tests with Vitest |
| `pnpm docker:dev:up` | Start development containers |
| `pnpm docker:dev:down` | Stop development containers |

## API Documentation

All endpoints are documented using OpenAPI (Swagger).
Access the Swagger UI at:

👉 `http://localhost:2409/api-docs`

## RBAC System

The permission system is divided into 2 levels:

### Workspace Scope
*   **workspace_owner**: Highest privilege, manages the entire workspace and billing.
*   **workspace_admin**: Manages members and boards.
*   **workspace_member**: Basic privileges, access and work on assigned boards.

### Board Scope
*   **board_owner**: Creator or owner of the board.
*   **board_admin**: Manages settings and members within the board.
*   **board_member**: Manipulates tasks and lists within the board.

---
**Maintainer**: Nguyen Huu Nhat Huy
