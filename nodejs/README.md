# Bus Station API — Node.js

Node.js implementation track for the Bus Station Management System. It lives alongside the legacy Swing client and the Java/Spring Boot API; neither is removed.

## Stack

- Node.js 22+
- Express 5
- Oracle Database via node-oracledb (Thin mode by default)
- Zod environment validation
- Helmet, CORS allow-list, and rate limiting
- Pino structured logging
- OpenAPI 3 / Swagger UI
- Node built-in test runner and Supertest

## Run locally

```bash
cd nodejs
cp .env.example .env
npm install
npm test
npm run dev
```

Endpoints:

- `GET http://localhost:3000/health/live` — liveness probe
- `GET http://localhost:3000/api/v1/system/status` — application status
- `GET http://localhost:3000/api/v1/system/ready` — readiness and Oracle connectivity
- `GET http://localhost:3000/api-docs` — OpenAPI / Swagger UI

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
  src/
    config/       # validated environment and logger
    database/     # Oracle pool lifecycle and health check
    middleware/   # consistent error responses
    routes/       # versioned HTTP routes
    app.js        # Express app composition
    server.js     # process lifecycle
  test/
  package.json
```

## Migration status

This is a runnable Node.js API foundation with system endpoints and Oracle pool integration. It is not yet a feature-complete port of the Swing application or Spring API. The original Oracle schema is not included in the repository, so ticket sales, timetables, employees, vehicles, garages, spare parts, and maintenance operations must be ported after the schema, keys, sequences, and business rules have been verified.

When implementing database repositories, use bind variables for every user-supplied value, explicit transactions for multi-step writes, and least-privilege database accounts. Authentication and role-based authorization are required before exposing administrative endpoints.
