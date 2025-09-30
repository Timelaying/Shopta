This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Overview

This repository contains a full‑stack application built with Next.js (App Router, TypeScript) and an Express + PostgreSQL backend.

### Directory highlights

| Path                                 | Purpose                                                                 |
|-------------------------------------- |-------------------------------------------------------------------------|
| src/app                              | Next.js “app” directory with routes for landing, authentication, and role‑specific UIs. |
| src/app/backend/server_apis_db        | Express server, database models, controllers, routes, and middleware.    |
| src/components & src/lib              | Reusable UI components (shadcn UI) and utilities.                       |
| src/app/context, hooks, services      | Client‑side auth context, React hooks, and Axios API layer.              |

### Key Concepts & Flow

#### Role‑based Frontend

Frontend/Customer, Frontend/Driver, and Frontend/Admin each hold Auth, Feed, and role‑specific pages (e.g., trip planning or monitoring).

Components under components2 provide maps (GoogleMap, Map) and trip/store lists.

Authentication & Authorization

Frontend uses AuthProvider (src/app/context/AuthContext.tsx) and a useAuth hook to manage JWTs in memory, relying on refresh tokens stored in HTTP-only cookies.

Axios instance (apiClient.ts) adds tokens to requests and auto‑refreshes when expired.

Backend uses JWT middleware (jwtMiddleware.ts) to protect API routes and stores refresh tokens in refresh_tokens table.

Backend Structure

Express server (server.ts) sets up REST routes for users, stores, items, trips, etc., and integrates Socket.IO for real‑time location updates.

Controllers interact with models (e.g., users.model.ts, trips.model.ts) to query PostgreSQL via pg pool.

db.ts initializes schema for users, stores, items, trips, and trip stops.

Mapping & Real‑time Updates

Frontend uses Google Maps and Leaflet for displaying store locations and trip paths.

Customers can also search for nearby stores on a Google Map by visiting `/Frontend/Customer/NearbyStores`. This feature relies on the Google Places API, so set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment.

Drivers send live location updates via sockets; admins view trip progress in real time.

Configuration & Utilities

Environment variables are loaded via dotenv (config.ts, jwtConfig.ts).

### Socket configuration

- `NEXT_PUBLIC_API_URL` (e.g., `http://localhost:5001/api`) continues to point to the REST API base path.
- `NEXT_PUBLIC_SOCKET_URL` is optional. When set, the frontend Socket.IO clients connect to this origin (e.g., `http://localhost:5001`).
- If `NEXT_PUBLIC_SOCKET_URL` is not provided, the clients derive the socket origin from `NEXT_PUBLIC_API_URL` by stripping any trailing `/api` segment.

Both the driver trip tracker and the admin live map now share this configuration helper to ensure they reach the Socket.IO server at `/socket.io` while leaving REST calls on the existing Axios client.

parseJwt and isTokenExpired utilities handle token parsing and expiry checks.

Pointers for Learning Next
Next.js App Router
Review how pages (page.tsx) and layouts (layout.tsx) define nested routes, client/server components, and route parameters.

Express + PostgreSQL
Examine how controllers and models interact with the database, and how the initializeDatabase function sets up schema migrations.

Authentication Patterns
Follow the flow from login/register forms, through apiClient interceptors, to AuthContext and backend JWT middleware.

Socket.IO Integration
Study how driver locations are emitted and consumed to drive real‑time maps.

Mapping Libraries
Compare the implementations of Google Maps (@react-google-maps/api) and Leaflet (react-leaflet) in components2.

Explore shadcn UI components (src/components/ui) and Tailwind CSS usage, as well as how components.json configures aliases.

### Next Steps
Next Steps

Set up a local PostgreSQL instance and configure .env variables for DB_* and JWT secrets.

Experiment with the trip planning flow, adding new steps or UI improvements.

Extend models/controllers to handle more complex business logic (e.g., store inventories, driver assignments).

Add unit/integration tests for both backend and frontend components.