# Segregation Service

A microservice that classifies objects into shape categories based on geometric descriptors (sides, symmetry axes, convex hull ratio) using rule-based classification (ADR-001, ADR-002).

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation

```bash
cd service
npm install
```

### Running

```bash
npm start
```

The service will start on port 3000 (or PORT env variable).

### API Endpoints

#### POST /classify
- Request body: `{ "sides": number, "symmetry_axes": number, "convex_hull_ratio": number }`
- Response: `{ "id": number, "category": string, "descriptors": {...} }`

#### GET /history
- Returns all previous classifications sorted by creation date descending.

## Technology Stack
- **Express.js** – HTTP server
- **better-sqlite3** – Persistence (ADR-003)
- **Rule-based classifier** – ADR-002

## Testing

```bash
# (tests not yet implemented)
```
