# Type Racer documentation

Type Racer is a real-time multiplayer typing game: a .NET 10 API with SignalR, a React single-page client and PostgreSQL, shipped as three Docker containers. These pages describe how the system is put together and how a race flows through it. They are written for a developer who opens the repository for the first time.

## Reading order

1. [Architecture](architecture.md) - system context, backend layering, runtime model, request flows, deployment and known limitations. Start here.
2. [Backend overview](backend/README.md) - the three .NET projects, their dependencies and configuration, with links to one chapter per layer.
3. [Frontend](frontend/README.md) - the React client, its state model and how it talks to the API and the SignalR hub.

## Map

| Document | Answers |
|---|---|
| [architecture.md](architecture.md) | What are the moving parts and how does a race travel through them? |
| [backend/README.md](backend/README.md) | Which projects exist, who references whom, where does configuration come from? |
| [backend/api-layer.md](backend/api-layer.md) | How does `Program.cs` wire the app, what does the request pipeline look like, how is JWT handled, what does `GameHub` do? |
| [backend/endpoints.md](backend/endpoints.md) | The full REST and SignalR contract: routes, payloads, hub methods and events. |
| [backend/core-layer.md](backend/core-layer.md) | Domain model, in-memory game state, application services and the game rules. |
| [backend/infrastructure-layer.md](backend/infrastructure-layer.md) | `AppDbContext`, the `Users` schema, repositories and the connection string. |
| [frontend/README.md](frontend/README.md) | Source layout, the `useGameLogic` hook, views and server communication. |

## Conventions

- Diagrams are authored in [Mermaid](https://mermaid.js.org/) under [`diagrams/src/`](diagrams/src/) and committed as pre-rendered SVGs with a light and a dark variant. Pages embed them with `<picture>` and `prefers-color-scheme`, so GitHub and GitLab show the variant that matches your theme, at full size and without the interactive viewer. Colours are consistent across pages: orange for the browser, grey for nginx, indigo for the Api project, green for Core, blue for Infrastructure, purple for PostgreSQL. After editing a source, run `python3 docs/diagrams/render.py` (see [`diagrams/README.md`](diagrams/README.md)).
- Code is referenced by relative links to files rather than line numbers, so the links stay valid as files change.
- Identifiers are quoted exactly as they appear in the code, including a few unusual spellings.

Running the project locally is described in the [root README](../README.md#run-locally-with-docker).
