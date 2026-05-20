<h1 align="center">
  TypeRacer
</h1>

<p align="center">
  A high-performance, real-time typing speed competition platform built with .NET 10 and React.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET_10-512BD4?logo=dotnet&logoColor=white" alt=".NET Version">
  <img src="https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black" alt="React Version">
  <img src="https://img.shields.io/badge/SignalR_Realtime-orange.svg" alt="SignalR">
  <img src="https://img.shields.io/badge/license_MIT-green.svg" alt="License">
</p>

## Features

* **Real-time Sync:** Uses SignalR (WebSockets) for bi-directional communication with sub-millisecond latency.
* **Server-side Validation:** Every keystroke is validated on the backend to prevent cheating and ensure accuracy.
* **Live WPM Calculation:** Dynamic Words Per Minute (WPM) tracking based on standard typing formulas.
* **Progress Tracking:** Real-time progress bars and error detection (visual feedback on typos).
* **Memory Efficient:** Optimized .NET 10 backend handling concurrent game states using thread-safe collections.

## Quick Start

### Prerequisites
- .NET 10 SDK
- Node.js & npm
- Docker
### Setup & Run

1. **Clone the repository:**
    ```bash
     git clone https://github.com/ZambrzyckiBartosz/Type-Racer.git
     cd Type-Racer
    ```

2. **Start Docker:**
   ```bash
   docker compose build
   docker compose up
   ```
3. **Enter localhost on browser**

## Usage

Once both services are running, navigate to http://localhost:3000. 
- Start typing the provided text.
- The system will detect your first keystroke to start the timer.
- Red highlights indicate a typo; you must correct it to proceed.
- WPM and Progress are updated live as you type.

## Architecture and Logic

The application follows a modern full-stack architecture:

* **Communication:** SignalR Hubs manage the state and push updates to the client without polling.
* **WPM Formula:** We use the standard (characters / 5) / (time_in_minutes) to calculate typing speed accurately.
* **Concurrency:** The backend utilizes ConcurrentDictionary to manage multiple player sessions and start times safely across threads.
* **Frontend:** React hooks (useState, useEffect) manage the local UI state and connection lifecycle.
