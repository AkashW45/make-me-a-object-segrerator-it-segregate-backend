# Shape Segregator

Multi-service project to segregate objects by their general shape.

## Repository Structure

- `client/` – Web client (HTML, CSS, JS) for user input and result display.
- `service/` – Backend microservice with rule-based classification and SQLite persistence.

## Architecture

- **Web Client**: Submits geometric descriptors to the service and shows classification.
- **Segregation Service**: Implements geometric descriptor extraction (simulated via input) and rule-based classification (ADR-001, ADR-002).
- **Segregation Database**: SQLite (ADR-003) stores each classification result.

## How to Run

### 1. Start the service

```bash
cd service
npm install
npm start
```

### 2. Serve the client

Open `client/index.html` in a browser (or use a simple server like `npx serve client`).

### 3. Use the application

Enter the number of sides, symmetry axes, and convex hull ratio, then click "Classify".

## Tech Stack

- **Client**: Vanilla HTML/CSS/JS
- **Service**: Node.js, Express, better-sqlite3
- **Persistence**: SQLite (file-based)

## ADR References

- ADR-001: Shape Representation using Geometric Descriptors
- ADR-002: Rule-Based Classification Engine
- ADR-003: Persistent Storage via SQLite
