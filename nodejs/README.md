# Bus Station API & Operations UI — Node.js

Node.js implementation track for the Bus Station Management System. It lives alongside the legacy Swing client and the Java/Spring Boot API; neither is removed.

## Stack

- Node.js 22+ and Express 5
- Oracle Database via node-oracledb (Thin mode by default)
- Zod environment validation
- Helmet, CORS allow-list, and rate limiting
- Pino structured logging
- OpenAPI 3 / Swagger UI
- Responsive, dependency-free operations dashboard (HTML, CSS, JavaScript)
- Node built-in test runner and Supertest

## Run locally

```bash
cd nodejs
cp .env.example .env
npm install
npm test
npm run dev
```

Open **http://localhost:3000** for the operations dashboard.

The dashboard reads the live service endpoints:

- `GET /health/live` — liveness probe
- `GET /api/v1/system/status` — application status
- `GET /api/v1/system/ready` — readiness and Oracle connectivity
- `GET /api-docs` — OpenAPI / Swagger UI

The dashboard refreshes service health every 30 seconds and can be refreshed manually. It is served by the same Express process, so it does not require a separate frontend server or CORS configuration in production.

## Frontend scope

The overview displays API health, Oracle configuration/connectivity, and links to the API reference. The sidebar includes the planned ticketing, routes, employee, fleet, and maintenance areas. Those pages are navigation placeholders only: the corresponding business API endpoints and verified database schema have not yet been implemented. No sample operational figures or fabricated records are displayed.

Static assets are in `public/` and are served by Express.

## Oracle configuration

Set the following in your local `.env` (or deployment environment):

```dotenv
DB_ENABLED=true
ORACLE_USER=your_user
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/FREEPDB1
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1
```

Unlike the JDBC URL used by Spring, node-oracledb expects an Oracle connect string such as `host:port/service_name` or an Oracle Net alias. Do not put credentials in source control.

## Project structure

```text
nodejs/
  public/           # Operations dashboard (HTML, CSS, browser JavaScript)
  src/
    config/         # validated environment and logger
    database/       # Oracle pool lifecycle and health check
    middleware/     # consistent error responses
    routes/         # versioned HTTP routes
    app.js           # Express app composition and static frontend
    server.js        # process lifecycle
  test/
  package.json
```

## Migration status

This is a runnable Node.js API and frontend foundation, not yet a feature-complete port of the Swing application or Spring API. The original Oracle schema is not included in the repository, so ticket sales, timetables, employees, vehicles, garages, spare parts, and maintenance operations must be ported after the schema, keys, sequences, and business rules have been verified.

When implementing database repositories, use bind variables for every user-supplied value, explicit transactions for multi-step writes, and least-privilege database accounts. Authentication and role-based authorization are required before exposing administrative endpoints.
