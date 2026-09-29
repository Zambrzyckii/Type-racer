# Type Racer - Real-Time Multiplayer Typing Game

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![SignalR](https://img.shields.io/badge/SignalR-0078D4?style=for-the-badge&logo=microsoft)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

##  Project Overview
Type Racer is a highly concurrent, real-time multiplayer web application where players compete in typing speed contests. Built with a focus on low-latency state synchronization, scalable architecture, and clean code principles, this project demonstrates full-stack capabilities from real-time backend processing to automated deployment.

##  Key Features
* **Real-Time Multiplayer Lobbies:** Low-latency bidirectional communication using **SignalR**.
* **Event-Driven Gameplay:** Implemented power-ups and debuffs targeting specific players using isolated Connecion ID's, preventing state leakage across shared browser sessions.
* **Secure Authentication & Profiles:** Custom account management with persistent statistics and leaderboards.
* **Production-Ready Deployment:** Hosted on a VPS, served via Nginx reverse proxy, and fully containerized with Docker.

---

##  Architecture & Design Patterns

The backend is strictly structured around **Clean Architecture** and **Domain-Driven Design** concepts to ensure separation of concerns, testability, and maintainability.

### Project Structure (Onion Architecture)
* **`Domain`**: Contains enterprise-wide logic, entities, value objects, and states (e.g., `PlayerData`, `RoomResults`). Zero external dependencies.
* **`Application`**: Contains business logic, interfaces, and services (`GameManager`, `LeaderboardManager`). It defines the rules of the game without knowing how data is stored.
* **`Infrastructure`**: Implements data access using **Entity Framework Core**. Utilizes the **Repository Pattern** (`LoginRepository`, `SaveScoreRepository`) to abstract database operations.
* **`Web/API`**: The entry point (`Program.cs`, `GameHub.cs`). Handles HTTP requests, SignalR WebSocket connections, and Dependency Injection setup.

---

##      Tech Stack

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

