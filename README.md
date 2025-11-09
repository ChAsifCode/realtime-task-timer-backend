Real-Time Collaborative Task Timer — Backend
Node.js + Express + MongoDB + Socket.IO + JWT
Server-authoritative timers with multi-user aggregation and real-time sync.

✨ Features
JWT auth (signup, login, email verification via OTP)

Task CRUD with collaborators (multi-member tasks)

Start/Stop timers per user per task (server is source of truth)

Aggregated live time = persisted total + sum(active sessions)

Socket.IO broadcasts:

timer:tick every second while any session is active

timer:started, timer:stopped, timer:allStopped

task:updated, task:membersUpdated


📁 Project Structure
.
├─ .env
├─ package.json
├─ socket.js                 # Socket.IO init, auth, rooms
├─ src/
│  ├─ config/
│  │  ├─ db.js               # Mongo connect
│  │  └─ keys.js             # ENV wrapper
│  ├─ controllers/
│  │  ├─ user/
│  │  │  ├─ index.js         # signup/login/verify
│  │  │  └─ service.js
│  │  │  └─ joi.schema.js
│  │  ├─ task/
│  │  │  ├─ index.js         # task CRUD + broadcasts
│  │  │  └─ joi.schema.js
│  │  └─ timer/
│  │     ├─ index.js         # start/stop/active/force-stop
│  │     └─ joi.schema.js
│  ├─ middlewares/
│  │  ├─ appRouteMiddlewares.js
│  │  ├─ attachIO.js         # attaches io to req
│  │  ├─ authMiddleware.js
│  │  └─ validateUserInput
│  ├─ models/
│  │  ├─ index.js
│  │  ├─ users.js
│  │  ├─ tasks.js
│  │  └─ timerSessions.js
│  ├─ routes/
│  │  ├─ index.js            # /api/v1
│  │  ├─ user.js             # /user
│  │  ├─ task.js             # /tasks
│  │  └─ timer.js            # /timers
│  ├─ utils/
│  │  ├─ responses/...
│  │  ├─ realtimeTicker.js   # 1 ticker per active task
│  │  ├─ jwtHelper.js        # sign/verify JWT
│  │  ├─ ApiError.js, Errorhandler.js, ...
│  │  └─ print.js
│  └─ ...
└─ index.js
🔧 Requirements
Node 18+


⚙️ Environment
Create .env from this template:

NODE_ENV=development
PORT=3030
MONGO_URI=mongodb://127.0.0.1:27017/realtime_task_timer
JWT_SECRET=supersecret_change_me

EMAIL_FROM=noreply@example.com
SMTP_HOST=your.smtp.host
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
Adjust SMTP settings if you’re actually sending OTP emails in development.
For quick tests you can stub sendEmail.


npm i
npm run dev   # or: npm start
You should see:

Server is running on port 3030...
This is development environment...
✅ Socket.IO initialized
MongoDB Connected...
🧪 Quick Test (REST)
Signup

POST /api/v1/user/signup
{
  "firstName":"Test",
  "lastName":"User",
  "email":"test@example.com",
  "password":"P@ssw0rd!",
  "confirmPassword":"P@ssw0rd!"
}
verify-email

POST /api/v1/user/verify-email
Authorization: Bearer <token>
{
  "otp":"000000",
  "otpType":"email_verfication",
}
Login

POST /api/v1/user/login
{ "email":"test@example.com", "password":"P@ssw0rd!" }

Create Task

POST /api/v1/tasks
Authorization: Bearer <token>
{
  "title":"Demo Task",
  "description":"testing"
}
Start Timer

POST /api/v1/timers/:taskId/start
Authorization: Bearer <token>
Stop Timer

POST /api/v1/timers/:taskId/stop
Authorization: Bearer <token>
Active Sessions

GET /api/v1/timers/:taskId/active
Authorization: Bearer <token>
 Socket.IO (Client Example)

import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: { token: JWT } // "Bearer ..." not required, both work
});

socket.emit("task:join", { taskId });

socket.on("timer:tick", ({ taskId, totalElapsedMs, activeCount }) => {
  // update UI every second
});

socket.on("timer:started", console.log);
socket.on("timer:stopped", console.log);
socket.on("timer:allStopped", console.log);
socket.on("task:updated", console.log);
socket.on("task:membersUpdated", console.log);
Rooms

Task room: task:${taskId}

User room: user:${userId}

 API Reference
Auth
POST /api/v1/user/signup

POST /api/v1/user/login

POST /api/v1/user/verify-email (protected; OTP + type)

Tasks (protected)
GET /api/v1/tasks — my/member tasks

POST /api/v1/tasks — create

GET /api/v1/tasks/:id — get single

PATCH /api/v1/tasks/:id — update title/description

DELETE /api/v1/tasks/:id — remove

POST /api/v1/tasks/:id/members — { userId }

DELETE /api/v1/tasks/:id/members — { userId }

GET /api/v1/tasks/:id/total — persisted total (active time comes from ticks)

Timers (protected)
POST /api/v1/timers/:taskId/start

POST /api/v1/timers/:taskId/stop

GET /api/v1/timers/:taskId/active

POST /api/v1/timers/:taskId/force-stop-all

🧠 Timer Logic & Concurrency
On start:

Create TimerSession { task, user, startedAt, stoppedAt:null }

Partial unique index { task, user, stoppedAt:null } prevents duplicates

Emit timer:started and ensure per-task ticker is running

Ticker (1/sec per active task):

Reads active sessions (no DB writes)

Broadcasts totalElapsedMs = task.totalElapsedMs + Σ(now - startedAt)

On stop:

Close session, calculate delta, persist with Task.$inc({ totalElapsedMs: delta })

Emit timer:stopped. Ticker auto-stops when no sessions remain.

Server is the source of truth — clients never send durations.

 Security
JWT: Authorization: Bearer <token>

Input validation via Joi

Mongo operator sanitization (Express v5-safe):


Blocks keys like $... and a.b by renaming (e.g., $gte → gte, a.b → a_b)

Members-only task access checks before any timer or update action

❗ CORS
Set CORS_ORIGIN to a comma-separated list:
http://localhost:5173,http://localhost:3000

❗ Socket auth failed
The client must pass JWT:

io(API_URL, { auth: { token: JWT } });
// or with header: extraHeaders: { Authorization: `Bearer ${JWT}` }
