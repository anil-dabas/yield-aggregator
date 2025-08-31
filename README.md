# Yield Aggregation Service

A TypeScript/Express service for aggregating yield opportunities from DeFi providers, using Kafka for decoupling and Redis for caching.

## Setup

1. Clone the repository.
2. Ensure Docker and Docker Compose are installed.
3. Start services: `docker-compose up --build`
4. Access the app at `http://localhost:3000`.

## API Endpoints

- **GET /health**: Check service status.
    - Response: `{ "status": "OK" }`
- **GET /api/earn/opportunities**: List all yield opportunities.
    - Response: Array of opportunities (see YieldOpportunity interface).
- **POST /api/earn/opportunities/match**: Match opportunities to user profile.
    - Request Body:
      ```json
      {
        "walletBalance": { "ETH": "5.0", "SOL": "100", "USDC": "10000" },
        "riskTolerance": 7,
        "maxAllocationPct": 25,
        "investmentHorizon": 90
      }