# Tandem Backend API

Spring Boot backend for the Tandem household management application.

## 🚀 Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Run the application (migrations run automatically)
./gradlew bootRun

# 3. Generate jOOQ classes (after first run)
./gradlew generateJooq
```

The API will be available at `http://localhost:8080`

## 📚 Documentation

- **[DATABASE.md](./DATABASE.md)** - Complete guide to Flyway migrations & jOOQ
- **[DOCKER.md](./DOCKER.md)** - PostgreSQL setup with Docker
- **[SECRETS.md](./SECRETS.md)** - Managing encrypted secrets
- **[ENCRYPTION_QUICK_START.md](./ENCRYPTION_QUICK_START.md)** - Jasypt encryption guide
- **[HELP.md](./HELP.md)** - Spring Boot reference documentation

## 🛠️ Tech Stack

- **Spring Boot 4.0.0-M3** - Application framework
- **Java 21** - Programming language
- **jOOQ** - Type-safe SQL query builder
- **Flyway** - Database migrations
- **PostgreSQL 16** - Database
- **Spring Security** - Authentication & authorization
- **Auth0** - OAuth2 identity provider
- **Jasypt** - Property encryption
- **Gradle** - Build tool

## 🗄️ Database

### Schema Management

Migrations are managed with **Flyway** and located in `src/main/resources/db/migration/`:

```
V1__users.sql           ✅ Applied
V2__add_cards.sql       (next migration)
```

Migrations run automatically when the application starts.

### Type-Safe Queries with jOOQ

jOOQ generates type-safe Java classes from your database schema:

```java
// Example: Type-safe query
List<UsersRecord> users = dsl.selectFrom(USERS)
    .where(USERS.EMAIL.eq("user@example.com"))
    .fetch();
```

**Generate jOOQ classes:**
```bash
./gradlew generateJooq
```

**Learn more:** See [DATABASE.md](./DATABASE.md) for complete guide.

## 🔐 Security

### Auth0 Integration

The API uses Auth0 for authentication. Configure in `application.properties`:

```properties
auth0.domain=https://your-domain.auth0.com
auth0.client-id=your-client-id
auth0.client-secret=ENC(encrypted-value)
```

### Secrets Management

Sensitive values are encrypted with Jasypt:

```bash
# Encrypt a value
./gradlew encryptProperty -Pvalue="your-secret"

# Set decryption password
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-master-password"
```

**Learn more:** See [SECRETS.md](./SECRETS.md)

## 🧪 Development

### Common Commands

```bash
# Run application
./gradlew bootRun

# Run tests
./gradlew test

# Build JAR
./gradlew build

# Clean build
./gradlew clean build

# Generate jOOQ classes
./gradlew generateJooq

# Encrypt a property
./gradlew encryptProperty -Pvalue="secret"
```

### Database Commands

```bash
# Start PostgreSQL
docker compose up -d postgres

# Stop PostgreSQL
docker compose down

# Reset database (WARNING: deletes data)
docker compose down -v

# Connect to database
docker compose exec postgres psql -U tandem -d tandemdb

# Check migrations
docker compose exec postgres psql -U tandem -d tandemdb -c "SELECT * FROM flyway_schema_history;"

# View tables
docker compose exec postgres psql -U tandem -d tandem
db -c "\dt"
```

## 📁 Project Structure

```
tandem-api/
├── src/
│   ├── main/
│   │   ├── java/com/tandem/
│   │   │   ├── auth/              # Authentication & Auth0
│   │   │   ├── config/            # Spring configuration
│   │   │   ├── util/              # Utilities
│   │   │   └── TandemBackendApplication.java
│   │   └── resources/
│   │       ├── db/migration/      # Flyway SQL migrations
│   │       └── application.properties
│   └── test/                      # Tests
├── build/
│   └── generated-sources/jooq/   # Generated jOOQ classes
├── docker-compose.yml             # PostgreSQL + pgAdmin
├── build.gradle                   # Gradle build config
└── [Documentation files]
```

## 🔄 Typical Development Workflow

### 1. Create a New Feature with Database Changes

```bash
# 1. Create migration file
touch src/main/resources/db/migration/V2__add_feature_table.sql

# 2. Write SQL migration
cat > src/main/resources/db/migration/V2__add_feature_table.sql << 'EOF'
CREATE TABLE feature (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

# 3. Start database
docker compose up -d postgres

# 4. Run app (migrations apply automatically)
./gradlew bootRun

# 5. Generate jOOQ classes
./gradlew generateJooq

# 6. Write your service using jOOQ
# (see DATABASE.md for examples)
```

### 2. Working with Existing Schema

```bash
# 1. Pull latest code
git pull

# 2. Start database
docker compose up -d postgres

# 3. Run app (new migrations apply)
./gradlew bootRun

# 4. Regenerate jOOQ classes
./gradlew generateJooq

# 5. Start coding!
```

## 🌐 API Endpoints

**Base URL:** `http://localhost:8080`

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login
- `POST /auth/resend-verification` - Resend verification email

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Households
- `GET /api/households` - List households
- `GET /api/households/{id}` - Get household
- `POST /api/households` - Create household
- `PUT /api/households/{id}` - Update household

*Note: Full API documentation to be added*

## 🧰 Troubleshooting

### Port 8080 already in use

```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

### Database connection errors

```bash
# Ensure PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### jOOQ classes not found

```bash
# Regenerate jOOQ classes
./gradlew clean generateJooq

# Refresh IntelliJ
Right-click project → Reload Gradle Project
```

### Migration checksum mismatch

You modified an already-applied migration. Either:
1. **Development:** Reset database: `docker compose down -v && docker compose up -d`
2. **Production:** Create a new migration file

## 📦 Building for Production

```bash
# Build JAR
./gradlew clean build

# Run JAR
java -jar build/libs/tandem-backend-0.0.1-SNAPSHOT.jar

# With environment variables
JASYPT_TANDEM_ENCRYPTOR_PASSWORD=secret \
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/tandemdb \
SPRING_DATASOURCE_USERNAME=prod_user \
SPRING_DATASOURCE_PASSWORD=prod_password \
java -jar build/libs/tandem-backend-0.0.1-SNAPSHOT.jar
```

## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Mobile App README](../tandem-mobile/README.md)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/)
- [jOOQ Documentation](https://www.jooq.org/doc/)
- [Flyway Documentation](https://flywaydb.org/documentation/)

## 📄 License

This project is private and proprietary.

---

**Need help?** Check the documentation files above or open an issue.



