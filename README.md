# TeamBoard

TeamBoard is a lightweight work management platform built for the full-stack assessment. It includes JWT authentication, project management, task management, MongoDB persistence, and a React dashboard.

## Tech Stack

- Backend: NestJS, TypeScript, MongoDB, Mongoose, JWT, Nest microservice TCP transport
- Frontend: React, Vite, TypeScript, React Router
- Shared: TypeScript contracts package
- Local orchestration: Docker Compose
- Deployment targets: Render backend, Vercel frontend, MongoDB Atlas database

## Features

- **Authentication**: Secure JWT-based login and signup.
- **Role-Based Access Control (RBAC)**: Team-wide collaboration on tasks with strict owner-only restrictions on project deletion and editing.
- **Task Management**: Create, update, and track tasks with priority levels and statuses.
- **Real-Time Project Stats**: Dashboard displays real-time badges for overdue and soon-due tasks.
- **Audit Trail**: Detailed, chronological logging of all project activities (creation, updates, task changes) accessible via a sliding sidebar.
- **Microservice-Ready Architecture**: Cross-domain communication over TCP simulating a distributed environment.

## Repository Structure

```txt
backend/   NestJS API and internal message handlers
frontend/  React Vite app
shared/    Shared TypeScript response contracts and enums
```

## Architecture

This repo is a monorepo, but the backend is written as a modular monolith with microservice-ready boundaries. Feature modules do not call each other’s services directly. Cross-boundary work uses NestJS message-style clients and `@MessagePattern()` handlers.

Current runtime:

```txt
React Frontend
  |
  v
NestJS HTTP API
  |
  +-- Auth Boundary
  |     +-- AuthController
  |     +-- AuthMessageController
  |     +-- AuthService
  |     +-- UsersRepository
  |
  +-- Project Boundary
  |     +-- ProjectsController
  |     +-- ProjectsMessageController
  |     +-- ProjectsService
  |     +-- ProjectsRepository
  |
  +-- Task Boundary
        +-- TasksController
        +-- TasksMessageController
        +-- TasksService
        +-- TasksRepository

MongoDB
```

Future microservice split:

```txt
                 +-------------------+
                 |  React Frontend   |
                 |      Vercel       |
                 +---------+---------+
                           |
                           v
                 +-------------------+
                 |    API Gateway    |
                 |      Render       |
                 +----+---------+----+
                      |         |
          +-----------+         +------------+
          v                                  v
+-------------------+              +-------------------+
|   Auth Service    |              |   Work Service    |
| Users, JWT, RBAC  |              | Projects, Tasks   |
+---------+---------+              +---------+---------+
          |                                  |
          +---------------+------------------+
                          v
                 +-------------------+
                 |  MongoDB Atlas    |
                 +-------------------+

Later: Redis or RabbitMQ can carry user.created, project.deleted, task.created, and task.updated events.
```

## API Summary

Auth:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

Projects:

- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `GET /projects/:projectId/audit-logs`

Tasks:

- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

All project and task routes require `Authorization: Bearer <token>`.

## Local Setup

Install dependencies:

```bash
npm install
```

Create backend environment:

```bash
cp backend/.env.example backend/.env
```

Run MongoDB locally, then start the backend:

```bash
npm run dev:backend
```

Start the frontend:

```bash
npm run dev:frontend
```

Frontend runs on `http://localhost:5173`. Backend runs on `http://localhost:3000`.

## Docker Setup

Create the root environment file:

```bash
cp .env.example .env
```

Start everything:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`

## Environment Variables

Backend:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_ORIGIN`
- `MICROSERVICE_HOST`
- `MICROSERVICE_PORT`

Frontend:

- `VITE_API_URL`

## Verification

Build all workspaces:

```bash
npm run build
```

Run backend tests:

```bash
npm test
```

Current test coverage includes auth negative paths and task ownership flow through the project client.

## Render Deployment

Use `render.yaml` or create a Render Web Service manually.

Recommended backend settings:

- Runtime: Docker
- Dockerfile: `backend/Dockerfile`
- Docker context: repository root
- Start command: handled by Dockerfile

Render environment variables:

- `MONGODB_URI=mongodb+srv://...`
- `JWT_SECRET=<long random secret>`
- `JWT_EXPIRES_IN=1d`
- `FRONTEND_ORIGIN=https://your-vercel-app.vercel.app`
- `MICROSERVICE_HOST=127.0.0.1`
- `MICROSERVICE_PORT=3001`

## Vercel Deployment

Recommended frontend settings:

- Root directory: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Vercel environment variable:

- `VITE_API_URL=https://your-render-api.onrender.com`

`frontend/vercel.json` includes a rewrite so browser refresh works on client routes.

## Design Decisions and Trade-offs

- The app is a modular monolith for assessment simplicity, but modules communicate through message contracts to keep microservice migration realistic.
- LocalStorage is used for JWT persistence because it is fast and simple for this assessment. A production app should evaluate httpOnly cookies and stricter XSS controls.
- Project deletion synchronously asks the task boundary to clean project tasks. In a distributed system this could become an event handled through Redis or RabbitMQ.
- The UI is intentionally a compact internal dashboard, not a marketing site.
