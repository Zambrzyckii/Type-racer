# Type Racer - Real-Time Multiplayer Typing Game

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![SignalR](https://img.shields.io/badge/SignalR-0078D4?style=for-the-badge&logo=microsoft)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## Project Overview
Type Racer is a highly concurrent, real-time multiplayer web application where players compete in typing speed contests. Built with a focus on low-latency state synchronization, scalable architecture, and clean code principles, this project demonstrates full-stack capabilities from real-time backend processing to automated deployment.

## Key Features
* **Real-Time Multiplayer Lobbies:** Low-latency bidirectional communication using **SignalR**.
* **Event-Driven Gameplay:** Implemented power-ups and debuffs targeting specific players using isolated Connection IDs, preventing state leakage across shared browser sessions.
* **Secure Authentication & Profiles:** Custom account management with persistent statistics and leaderboards.
* **Production-Ready Deployment:** Hosted on a VPS, served via Nginx reverse proxy, and fully containerized with Docker.

---

## Architecture & Design Patterns

The backend is a layered .NET solution inspired by **Clean Architecture**: the Api project depends on Infrastructure and Core, Infrastructure depends on Core, and Core has no project references. Game rules live in Core and reach the database only through repository interfaces.

### Project Structure (`TypeRacerServer/`)
* **`Core`**: `Domain/` holds the `User` entity, value objects (`Username`, `Password`), game constants and the in-memory `GameState`; `Application/` holds one service per use case (`JoinRoomService`, `SendProgressService`, `EndGameProcessService`, ...), their result records and the repository interfaces.
* **`Infrastructure`**: Implements data access using **Entity Framework Core** with Npgsql. Utilizes the **Repository Pattern** (`LoginRepository`, `SaveScoreRepository`, ...) over a single `AppDbContext`.
* **`Api`**: The entry point (`Program.cs`, `GameHub.cs`, controllers). Handles HTTP requests, JWT authentication, SignalR WebSocket connections and Dependency Injection setup, and translates Core results into real-time events.

Diagrams, request flows and design notes: [docs/architecture.md](docs/architecture.md).

---

## Tech Stack

### Backend
* **C# / .NET 10** - Core framework.
* **SignalR** - WebSockets engine for real-time multiplayer synchronization.
* **Entity Framework Core** - ORM for database operations.
* **PostgreSQL** - Relational database for robust, concurrent data storage.

### Frontend
* **React.js** - UI components and state management (located in `/typeracer-client`).

### DevOps & Infrastructure
* **Docker & Docker Compose** - Containerization for isolated and consistent environments.
* **Nginx** - Reverse proxy and load balancer.
* **VPS** - Production hosting environment using `systemd` for process management.

---

## Run Locally with Docker

Prerequisites: Docker with Compose v2.

```bash
git clone https://github.com/Zambrzyckii/type-racer.git
cd type-racer
docker compose up --build
```

Open http://localhost:3000. Nginx serves the React build and proxies `/api` and `/gamehub` (SignalR WebSockets) to the .NET API, so the whole app runs on one origin. PostgreSQL data persists in the `pgdata` volume and the schema is created on first start. Development defaults for the database password and the JWT key are set in `docker-compose.yml`; to override them run `cp .env.example .env` and edit the values.

---

## Documentation

* [docs/README.md](docs/README.md) - index and reading order
* [Architecture and application flow](docs/architecture.md)
* [Backend: API layer, endpoints, Core, Infrastructure](docs/backend/README.md)
* [Frontend (React)](docs/frontend/README.md)
