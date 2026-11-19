# Bus Station Management System

A bus-station management application originally developed as a Java Swing / Oracle desktop system.

## Project tracks

### Legacy desktop application

The original NetBeans project remains under `src/avtobuska`. Its workflows cover ticket sales and updates, route/timetable management, employee administration, vehicles, garages, spare parts, and maintenance inspections.

It is preserved for reference and for a gradual migration. It currently uses the legacy Ant/NetBeans build and an Oracle schema that is not included in this repository.

### Modernized API

A new Java 21 / Spring Boot REST API is being introduced separately under [`modernized/`](modernized/README.md). It establishes the modern build, runtime configuration, health endpoints, API documentation, and an opt-in Oracle connection without changing the original desktop application.

See [modernized/README.md](modernized/README.md) for the Java setup and [nodejs/README.md](nodejs/README.md) for the Node.js API and dashboard setup.

### Node.js API

A parallel Node.js / Express API implementation is available under [`nodejs/`](nodejs/README.md). It provides a separate runtime and port, Oracle pool integration, health endpoints, OpenAPI documentation, and automated tests. Both API tracks are retained for evaluation; neither replaces the Swing client.

## Security

The legacy client now reads its database connection settings from DB_URL, DB_USERNAME, and DB_PASSWORD environment variables. However, the old credentials remain in Git history and must be rotated. The legacy database layer still constructs SQL through string concatenation and must be migrated to prepared statements before production use. The modernized module does not ship with credentials.

## Current limitations

- The original Oracle database schema and sample data are not included.
- The new API is a migration foundation, not yet a feature-complete replacement for the Swing client.
- Authentication, authorization, and business endpoints must be implemented before the API is exposed to untrusted networks.
