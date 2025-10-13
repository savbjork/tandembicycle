# Docker Setup Guide

This guide explains how to run the Tandem application with Docker.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start PostgreSQL Database

From the `tandem-api` directory:

```bash
cd tandem-api

# Make sure Docker Desktop is running first!
docker compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **pgAdmin** (optional web UI) on `http://localhost:5050`

### 2. Verify Database is Running

```bash
docker compose ps
```

You should see both `tandem-postgres` and `tandem-pgadmin` running.

### 3. Run the Spring Boot Application

From the same `tandem-api` directory:

```bash
./gradlew bootRun
```

Or run it from IntelliJ using the run configuration.

## Services

### PostgreSQL Database

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `tandemdb`
- **Username**: `tandem`
- **Password**: `tandem_dev_password`

### pgAdmin (Database Management UI)

Access at: `http://localhost:5050`

- **Email**: `admin@example.com`
- **Password**: `admin`

#### Connect to PostgreSQL in pgAdmin:

1. Open `http://localhost:5050`
2. Login with the credentials above
3. Right-click "Servers" → "Register" → "Server"
4. **General Tab**:
   - Name: `Tandem Local`
5. **Connection Tab**:
   - Host: `postgres` (or `host.docker.internal` on Mac/Windows)
   - Port: `5432`
   - Database: `tandemdb`
   - Username: `tandem`
   - Password: `tandem_dev_password`

## Common Commands

### Start services
```bash
docker compose up -d
```

### Stop services
```bash
docker compose down
```

### Stop and remove data (fresh start)
```bash
docker compose down -v
```

### View logs
```bash
# All services
docker compose logs -f

# Just PostgreSQL
docker compose logs -f postgres
```

### Connect to PostgreSQL via CLI
```bash
docker compose exec postgres psql -U tandem -d tandemdb
```

### Restart services
```bash
docker compose restart
```

### Check service health
```bash
docker compose ps
```

## Data Persistence

Database data is persisted in Docker volumes:
- `postgres_data` - PostgreSQL data
- `pgadmin_data` - pgAdmin settings

Even if you stop containers, your data remains. To completely reset:
```bash
docker compose down -v  # Warning: This deletes all data!
```

## Troubleshooting

### Port 5432 already in use

If you have PostgreSQL installed locally:

**Option 1**: Stop local PostgreSQL
```bash
# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

**Option 2**: Change the port in `docker compose.yml`
```yaml
ports:
  - "5433:5432"  # Use 5433 instead
```
Then update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/tandemdb
```

### Connection refused

Make sure the database is fully started:
```bash
docker compose logs postgres
```

Wait for: `database system is ready to accept connections`

### Reset database

To start fresh:
```bash
docker compose down -v
docker compose up -d
```

Wait a few seconds for PostgreSQL to initialize, then restart your Spring Boot app.

## Production Considerations

⚠️ **This setup is for LOCAL DEVELOPMENT ONLY**

For production:
1. Use strong passwords (not the defaults)
2. Don't expose pgAdmin publicly
3. Use managed database services (AWS RDS, Google Cloud SQL, etc.)
4. Configure proper backup strategies
5. Use environment variables for sensitive data
6. Enable SSL connections

## Environment Variables

You can customize the setup using environment variables. Create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` with your custom values. Docker Compose will automatically load them.

## Integration with CI/CD

For testing in CI/CD pipelines:

```bash
cd tandem-api

# Start database
docker compose up -d postgres

# Wait for healthy state
docker compose exec postgres pg_isready -U tandem

# Run tests
./gradlew test

# Cleanup
docker compose down
```

