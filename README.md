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
├── trip-analytics-service/      # microservice for analytics, promotions, referrals (Node.js/TS)
├── shopping-taxi-app/           # front-end and API gateway (Next.js, TypeScript)
├── Dockerfile.backend           # Docker instructions for backend services
├── Dockerfile.frontend          # Docker instructions for frontend
└── .github/workflows/           # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js and npm installed locally.
- Python 3.8+ and pip.
- Docker and Docker Compose (optional for containerised setup).

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

Alternatively, run everything with Docker Compose:

```bash
docker compose up --build
```

The application will be available at `http://localhost:3000`.

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
