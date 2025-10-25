# RBAC Demo (Node.js + Express + JWT)

Role-Based Access Control (RBAC) demo API with a simple web UI. Includes Admin, Moderator, and User roles secured by JWT. Built with Express.

## Features
- JWT login with role in token payload
- Middleware to verify token and authorize routes by role
- UI to login and click protected routes (Admin, Moderator, User)
- Demo users for quick testing

## Demo Users
- Admin: `admin@example.com` / `admin123`
- Moderator: `mod@example.com` / `moderator123`
- User: `user@example.com` / `user123`

## Endpoints
- `POST /login` — returns `{ token, user }`
- `GET /admin/dashboard` — Admin only
- `GET /moderator/tools` — Admin or Moderator
- `GET /user/profile` — Any authenticated user

## Run Locally
```sh
npm install
npm start
# open http://localhost:3000
```

## Environment
Create `.env`:
```
PORT=3000
JWT_SECRET=change_me
JWT_EXPIRES_IN=1h
```

## Tech
- Express, jsonwebtoken, bcryptjs, dotenv, cors, morgan
- Axios test script (`node test.js`)

## Screenshots
Use the UI at `http://localhost:3000` to login and hit protected routes for screenshots.