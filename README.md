# Shopta – Shopping Taxi Platform

Shopta is a full-stack platform that combines on-demand shopping and taxi services into one seamless experience. It uses a microservices architecture to power routing, promotions, and analytics services.

## Features

- Centralized socket-based server for handling real-time communication.
- Route optimizer microservice for calculating efficient delivery and ride routes.
- Trip analytics microservice providing insights, promotions and referral calculations.
- Modular design – separate frontend and backend components.
- Dockerized development environment with CI/CD pipelines.
- TypeScript / Node.js backend and React / Next.js frontend.
- Python components for AI routing and analytics.
- Ready for Kubernetes deployments.

## Tech Stack

- **Languages:** TypeScript (Node.js/Next.js), Python, Java.
- **Frameworks & Libraries:** Express, React, Next.js, gRPC, FastAPI.
- **Databases:** PostgreSQL, MongoDB.
- **Infrastructure:** Docker, Docker Compose, GitHub Actions (CI/CD).
- **Other:** WebSockets for real-time updates, RESTful and gRPC APIs.

## Architecture

This repository contains multiple services:

```
.
├── route_optimizer_service/     # microservice for route optimisation (Python)
├── trip-analytics-service/      # microservice for analytics, promotions, referrals (Java/Spring Boot)
├── shopping-taxi-app/           # front-end and API gateway (Next.js, TypeScript)
├── db/                          # PostgreSQL schema migrations and deterministic seeds
├── docker-compose.yml           # Local orchestration for PostgreSQL and services
├── Dockerfile.backend           # Docker instructions for backend services
├── Dockerfile.frontend          # Docker instructions for frontend
├── Dockerfile.route-optimizer   # Docker instructions for the FastAPI optimizer
├── Dockerfile.trip-analytics    # Docker instructions for the Spring Boot analytics service
└── .github/workflows/           # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js and npm installed locally.
- Python 3.8+ and pip.
- Docker and Docker Compose (optional for containerised setup).

### Environment

Create a local environment file from the example before running services:

```bash
cp .env.example .env
```

The example lists the required secrets and connection settings, including the JWT access/refresh token secrets, PostgreSQL URI (`DATABASE_URL`), and Google Maps/Places API keys used by the map UI and store seeding utilities.

### Database setup

For a local PostgreSQL instance, apply the schema and deterministic seed data with:

```bash
export DATABASE_URL=postgresql://shopta:shopta_password@localhost:5432/shopta
npm run db:setup
```

The same SQL files are mounted into the PostgreSQL container by Docker Compose, so a fresh Compose volume is migrated and seeded automatically on first startup.

### Local Development

Clone the repository and install dependencies for each service:

```bash
git clone https://github.com/Timelaying/Shopta.git
cd Shopta

# Backend services
cd route_optimizer_service
pip install -r requirements.txt

cd ../trip-analytics-service
npm install

# Frontend/API
cd ../shopping-taxi-app
npm install
```

Start services locally (use separate terminals):

```bash
# Start route optimizer service
cd route_optimizer_service
python main.py

# Start trip analytics service
cd ../trip-analytics-service
npm run dev

# Start front-end/API
cd ../shopping-taxi-app
npm run dev
```

Alternatively, run PostgreSQL, the backend API, frontend, route optimizer, and trip analytics services with Docker Compose:

```bash
docker compose up --build
```

The frontend will be available at `http://localhost:3000`, the backend API at `http://localhost:5001/api`, PostgreSQL at `localhost:5432`, the route optimizer at `http://localhost:8000`, and trip analytics at `http://localhost:8085`.

## Tests

Each service has its own tests. Run them with:

```bash
# Python tests
cd route_optimizer_service
pytest

# Node.js/TS tests
cd ../trip-analytics-service
npm test

cd ../shopping-taxi-app
npm test
```

## Roadmap

- Implement payment gateway integration.
- Add mobile applications.
- Improve AI models for routing and promotions.
- Scale services with Kubernetes and Helm.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
