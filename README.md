# Yield Aggregation Service

A TypeScript/Express service for aggregating yield opportunities from DeFi providers, using Kafka for decoupling and Redis for caching.

## Setup

1. Clone the repository.
2. Ensure Docker and Docker Compose are installed.
3. Start services: `docker-compose up --build`
4. This will start the backend service, Redis, Postgres, and Kafka.
5. For frontend 
   1. Go to yield-aggregator/frontend directory: `cd yield-aggregator/frontend`
   2. run `npm install` to install dependencies.
   3. run `npm run serve` to start the frontend. 
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