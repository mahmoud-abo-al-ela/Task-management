# Task Manager

A task management web app built with the MERN stack and TypeScript. Users register, sign in, and
manage their own tasks — with search, filtering, a drag-and-drop board, and image attachments.

Each user only ever sees their own data: every task query is scoped to the signed-in user at the
database level, not checked afterwards.

## Live demo

**<https://task-management-inky-five.vercel.app>**

You can register a new account, or sign in with the test account:

| Email           | Password   |
| --------------- | ---------- |
| `user@test.com` | `test1234` |

> [!NOTE]
> The API is hosted on Render's free tier, which spins down after inactivity. **The first request
> can take up to a minute** while it wakes up — after that it is responsive. If the first login
> seems to hang, give it a moment rather than retrying.

## Features

### Accounts and access

| Feature                 | Built with                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Registration and login  | Express routes, **bcrypt** for password hashing                                                |
| Session authentication  | **jsonwebtoken**, stored in an **httpOnly cookie** so page scripts cannot read it              |
| Protected API routes    | Express middleware that verifies the cookie before any task handler runs                       |
| Per-user task isolation | Every Mongoose query is scoped with the owner's id, so another user's task is simply not found |
| Brute-force protection  | **express-rate-limit** on the login and register routes                                        |

### Tasks

| Feature                                        | Built with                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| Create, view, edit, delete                     | **Express** REST endpoints and **Mongoose** models                         |
| Title, description, status, priority, due date | Mongoose schema with enums for status and priority                         |
| Filter by status and priority                  | MongoDB query conditions, combinable with search                           |
| Pagination                                     | MongoDB `skip`/`limit` with a parallel count query                         |
| Image attachments                              | **multer** for the upload, stored as binary in MongoDB (PNG/JPG, max 2 MB) |

### Interface

| Feature                          | Built with                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| App shell and routing            | **React 19**, **React Router**                                                                                         |
| Components and styling           | **shadcn/ui** on **Tailwind CSS**, **lucide-react** icons                                                              |
| Server data, caching, refetching | **TanStack Query** — filters form the query key, so changing one refetches automatically                               |
| Session state                    | **React Context**                                                                                                      |
| Forms and inline validation      | **react-hook-form** with **zod** schemas                                                                               |
| Search input                     | **use-debounce**, so typing does not fire a request per keystroke                                                      |
| Drag and drop between statuses   | **dnd-kit**                                                                                                            |
| Notifications                    | **sonner** toasts                                                                                                      |
| Loading, error and empty states  | Skeleton placeholders, a retry action, and separate empty states for "no tasks yet" and "nothing matches your filters" |
| Responsive layout                | Tailwind breakpoints                                                                                                   |

### Tooling

| Purpose                   | Built with                                                   |
| ------------------------- | ------------------------------------------------------------ |
| API tests                 | **Vitest**, **Supertest**, **mongodb-memory-server**         |
| Security headers and CORS | **helmet**, **cors** locked to a single origin               |
| Request validation        | **zod** schemas checked by middleware before controllers run |

## Getting started

### Prerequisites

- **Node.js 18 or newer**
- **npm**
- A **MongoDB** database — a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local
  instance

### 1. Clone and install

```bash
git clone https://github.com/mahmoud-abo-al-ela/Task-management.git
cd Task-management

cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Fill in `.env`:

| Variable         | Required | Description                                                       |
| ---------------- | :------: | ----------------------------------------------------------------- |
| `MONGODB_URI`    |   yes    | MongoDB connection string, **including the database name**        |
| `JWT_SECRET`     |   yes    | Secret used to sign tokens. Use a long random string              |
| `PORT`           |    no    | API port. Defaults to `5000`                                      |
| `NODE_ENV`       |    no    | `development`, `test` or `production`                             |
| `JWT_EXPIRES_IN` |    no    | Session lifetime. Defaults to `7d`                                |
| `CLIENT_ORIGIN`  |    no    | Frontend URL allowed by CORS. Defaults to `http://localhost:5173` |

> [!IMPORTANT]
> The Atlas connection string ends with `...mongodb.net/?retryWrites=true`. Add the database name
> before the `?`, otherwise Mongo silently uses a database called `test`:
> `...mongodb.net/taskmanager?retryWrites=true`

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Configure the client

```bash
cd client
cp .env.example .env
```

| Variable       | Required | Description                                           |
| -------------- | :------: | ----------------------------------------------------- |
| `VITE_API_URL` |    no    | API base URL. Defaults to `http://localhost:5000/api` |

### 4. Run both apps

In two terminals:

```bash
cd server && npm run dev     # http://localhost:5000
```

```bash
cd client && npm run dev     # http://localhost:5173
```

Open <http://localhost:5173> and register an account.

> [!NOTE]
> Both must run at once. The client is a separate app that talks to the API over HTTP, and the API
> only accepts requests from the origin in `CLIENT_ORIGIN`.

## Scripts

**Server** (`cd server`)

| Command         | Description                                   |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start with auto-restart on change             |
| `npm run build` | Type-check and compile to `dist/`             |
| `npm start`     | Run the compiled app (requires `build` first) |
| `npm test`      | Run the API test suite                        |

**Client** (`cd client`)

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the Vite dev server           |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Serve the production build locally  |
| `npm run lint`    | Lint with oxlint                    |

## Project structure

The frontend and backend are separate applications with their own dependencies and configuration.

```
├── client/                 React app
│   └── src/
│       ├── components/
│       │   ├── ui/         shadcn/ui primitives
│       │   ├── layout/     Navbar, AuthLayout
│       │   └── tasks/      Task list, board, card, form, filters
│       ├── context/        AuthContext — session state
│       ├── hooks/          TanStack Query hooks for tasks and attachments
│       ├── lib/            axios instance, shared constants
│       ├── pages/          Login, Register, Dashboard
│       ├── schemas/        zod schemas for form validation
│       └── types.ts        Shared TypeScript types
│
└── server/                 Express API
    └── src/
        ├── config/         Database connection
        ├── controllers/    Request handlers
        ├── middleware/     auth, validation, uploads, rate limiting, errors
        ├── models/         Mongoose schemas
        ├── routes/         Route definitions
        ├── validators/     zod schemas for request bodies
        ├── app.ts          Express app (no server)
        └── index.ts        Entry point — connects to Mongo, then listens
```

`app.ts` builds the Express app without binding a port, so tests can import it directly with
Supertest. `index.ts` is the only file that calls `listen()`.

## API

Base URL: `http://localhost:5000/api`

Authentication uses an httpOnly cookie set at login. It is sent automatically by the browser —
there is no `Authorization` header to manage.

### Auth

| Method | Endpoint         | Auth | Description                           |
| ------ | ---------------- | :--: | ------------------------------------- |
| `POST` | `/auth/register` |  —   | Create an account and start a session |
| `POST` | `/auth/login`    |  —   | Sign in                               |
| `POST` | `/auth/logout`   |  —   | Clear the session cookie              |
| `GET`  | `/auth/me`       |  ✅  | Get the signed-in user                |

### Tasks

| Method   | Endpoint                | Auth | Description                |
| -------- | ----------------------- | :--: | -------------------------- |
| `GET`    | `/tasks`                |  ✅  | List your tasks, paginated |
| `POST`   | `/tasks`                |  ✅  | Create a task              |
| `PATCH`  | `/tasks/:id`            |  ✅  | Update a task              |
| `DELETE` | `/tasks/:id`            |  ✅  | Delete a task              |
| `GET`    | `/tasks/:id/attachment` |  ✅  | Get a task's image         |

`GET /tasks` accepts `search`, `status`, `priority`, `page` and `limit` as query parameters. All are
optional and combine. `limit` defaults to 10 and is capped at 50.

```http
GET /api/tasks?search=report&status=in_progress&priority=high&page=1&limit=10
```

```json
{
  "tasks": [ ... ],
  "page": 1,
  "totalPages": 3,
  "total": 24
}
```

`POST /tasks` and `PATCH /tasks/:id` accept **JSON or `multipart/form-data`**. Use multipart to
include an image in the same request — send it as an `image` field. Send `removeAttachment=true` to
remove an existing image.

### Other

| Method | Endpoint  | Description                             |
| ------ | --------- | --------------------------------------- |
| `GET`  | `/health` | Liveness check for deployment platforms |

## Deployment

The two apps are deployed separately, with the database on MongoDB Atlas.

| Part     | Host          | Notes                                                                                     |
| -------- | ------------- | ----------------------------------------------------------------------------------------- |
| API      | Render        | Root directory `server`, build `npm ci --include=dev && npm run build`, start `npm start` |
| Client   | Vercel        | Root directory `client`, Vite preset                                                      |
| Database | MongoDB Atlas | Network access opens `0.0.0.0/0`, since Render's outbound IPs are not fixed               |

## Testing

```bash
cd server
npm test
```

The suite covers registration, login, session handling, task CRUD, search, filtering, pagination,
and — most importantly — that one user cannot read, update or delete another user's tasks.

Tests run against a real MongoDB instance started in memory, so queries, indexes and unique
constraints are genuinely exercised. Nothing is mocked and your real database is never touched.

## Known issues and limitations

- **The demo API sleeps when idle.** On Render's free tier the first request after a period of
  inactivity takes up to a minute while the service restarts.
- **Attachments are stored in MongoDB** as binary data rather than in object storage. This avoids a
  third-party dependency, but it inflates documents and does not scale. S3 or Cloudinary would be
  the production choice. The 2 MB limit exists partly because MongoDB caps a document at 16 MB.
- **Drag and drop is desktop only.** On touch screens, dragging competes with scrolling, so mobile
  uses the list view and status is changed through the edit form.

## Notes on development

This project was built with the help of AI tooling (Claude Code) for scaffolding, code review, and
documentation. All architectural decisions, library choices and trade-offs were reviewed and made
deliberately, and the reasoning behind each is documented.
