# Modernized Bus Station API

This is the new application track for the legacy Bus Station desktop system. It is intentionally kept in a separate directory so the existing NetBeans/Swing application remains available while the replacement is developed incrementally.

## Technology baseline

- Java 21
- Spring Boot 3.5
- Spring MVC REST API
- Spring JDBC with HikariCP
- Oracle JDBC 23
- Jakarta Bean Validation
- Spring Boot Actuator
- OpenAPI / Swagger UI
- Maven

## Run locally

Requirements: JDK 21 and Maven 3.9+.

```bash
cd modernized
mvn test
mvn spring-boot:run
```

The API starts without an Oracle connection by default. Verify it:

- `GET http://localhost:8080/api/v1/system/status`
- `GET http://localhost:8080/actuator/health`
- `GET http://localhost:8080/v3/api-docs`
- `GET http://localhost:8080/swagger-ui.html`

## Enable Oracle connectivity

Supply connection details through environment variables; never commit credentials:

```bash
export DB_ENABLED=true
export DB_URL='jdbc:oracle:thin:@//localhost:1521/YOUR_SERVICE'
export DB_USERNAME='YOUR_USERNAME'
export DB_PASSWORD='YOUR_PASSWORD'
mvn spring-boot:run
```

The Oracle schema is not provisioned by this module. The existing application depends on an established schema containing ticketing, route, employee, vehicle, garage, and maintenance data. Repository implementations and schema migrations should be added only after that schema has been documented and verified.

## Migration approach

1. Keep the original Swing client operational during the transition.
2. Document the Oracle schema, constraints, views, and sequences; establish a safe development database.
3. Move ticket sales, timetable lookup, and ticket updates into tested service/repository modules using parameterized SQL and transactions.
4. Add authentication and role-based authorization before exposing administrative operations.
5. Migrate employee, vehicle, garage, parts, and maintenance workflows.
6. Build a separate web frontend against the versioned REST API.
7. Retire the Swing client only after feature parity, data migration, and user acceptance testing.

## Important security note

The legacy source currently contains database connection credentials and SQL built through string concatenation. Treat any credentials committed in the old source as compromised and rotate them. This new module does not contain default database credentials. Do not expose the API to untrusted networks until authentication, authorization, and the remaining business endpoints are implemented.
