# Bus Station Management System

A bus-station management application originally developed as a Java Swing / Oracle desktop system.

## Project tracks

### Legacy desktop application

The original NetBeans project remains under `src/avtobuska`. Its workflows cover ticket sales and updates, route/timetable management, employee administration, vehicles, garages, spare parts, and maintenance inspections.

It is preserved for reference and for a gradual migration. It currently uses the legacy Ant/NetBeans build and an Oracle schema that is not included in this repository.

### Modernized API

A new Java 21 / Spring Boot REST API is being introduced separately under [`modernized/`](modernized/README.md). It establishes the modern build, runtime configuration, health endpoints, API documentation, and an opt-in Oracle connection without changing the original desktop application.

See [modernized/README.md](modernized/README.md) for setup and the migration roadmap.

## Security

Do not use the legacy application with production data until its committed database credentials have been rotated and its SQL statements have been migrated to prepared statements. The modernized module reads database connection settings from environment variables and does not ship with credentials.

## Current limitations

- The original Oracle database schema and sample data are not included.
- The new API is a migration foundation, not yet a feature-complete replacement for the Swing client.
- Authentication, authorization, and business endpoints must be implemented before the API is exposed to untrusted networks.
