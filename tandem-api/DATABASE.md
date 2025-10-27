# Database Setup Guide

This guide covers database migrations with Flyway and using jOOQ for type-safe SQL queries.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Migrations (Flyway)](#database-migrations-flyway)
- [jOOQ Setup](#jooq-setup)
- [Using jOOQ](#using-jooq)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

**Tech Stack:**
- **PostgreSQL 16** - Database (running in Docker)
- **Flyway** - Database migrations
- **jOOQ** - Type-safe SQL query builder
- **Spring Data JPA** - Optional ORM (available but not primary)

### Why jOOQ?

✅ **Type-safe SQL** - Compile-time safety  
✅ **Full SQL power** - Use all PostgreSQL features  
✅ **Code generation** - Tables, records, DAOs generated from schema  
✅ **Great IDE support** - Autocomplete for tables and columns  
✅ **Performance** - Direct SQL, no ORM overhead  

## Database Migrations (Flyway)

### How It Works

Flyway automatically runs SQL migration scripts on application startup:
1. Connects to PostgreSQL
2. Creates `flyway_schema_history` table (if not exists)
3. Runs new migrations in order (V1, V2, V3, ...)
4. Tracks which migrations have been applied

### Migration File Naming Convention

```
V{version}__{description}.sql

Examples:
✅ V1__users.sql
✅ V2__add_cards_table.sql
✅ V3__add_user_roles.sql
✅ V4__alter_households_add_created_by.sql

❌ v1__users.sql           (lowercase v)
❌ V1_users.sql            (single underscore)
❌ migration_users.sql     (no version)
```

### Creating Migrations

**Location:** `src/main/resources/db/migration/`

**Example - V1__users.sql:**
```sql
-- Create households table first (referenced by users table)
CREATE TABLE IF NOT EXISTS households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    household_id INT,
    CONSTRAINT fk_household FOREIGN KEY (household_id) 
        REFERENCES households(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_household_id ON users(household_id);
```

**Example - V2__add_cards_table.sql:**
```sql
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    household_id INT,
    assigned_to_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cards_household FOREIGN KEY (household_id) 
        REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_cards_user FOREIGN KEY (assigned_to_user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_household ON cards(household_id);
CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(assigned_to_user_id);
```

### Running Migrations

Migrations run automatically when you start the application:

```bash
./gradlew bootRun
```

**You'll see output like:**
```
INFO o.f.c.i.s.JdbcTableSchemaHistory : Creating Schema History table "public"."flyway_schema_history"
INFO org.flywaydb.core.Flyway        : Migrating schema "public" to version "1 - users"
INFO org.flywaydb.core.Flyway        : Migrating schema "public" to version "2 - add cards table"
INFO org.flywaydb.core.Flyway        : Successfully applied 2 migrations
```

### Checking Migration Status

```bash
# Via Docker CLI
docker compose exec postgres psql -U tandem -d tandemdb -c "SELECT * FROM flyway_schema_history;"

# Via psql
\c tandemdb
SELECT version, description, installed_on, success FROM flyway_schema_history;
```

### Important Migration Rules

⚠️ **Never modify an already-applied migration!**

Flyway checksums each migration. Changing it will cause errors.

**If you need to change something:**
1. Create a NEW migration file with a higher version
2. Use `ALTER TABLE` statements

```sql
-- V3__alter_users_add_phone.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

## jOOQ Setup

### Configuration

jOOQ is configured in `build.gradle`:

```gradle
plugins {
    id 'nu.studer.jooq' version '9.0'
}

jooq {
    configurations {
        main {
            generateSchemaSourceOnCompilation = true
            
            generationTool {
                jdbc {
                    driver = 'org.postgresql.Driver'
                    url = 'jdbc:postgresql://localhost:5432/tandemdb'
                    user = 'tandem'
                    password = 'tandem_dev_password'
                }
                
                generator {
                    database {
                        name = 'org.jooq.meta.postgres.PostgresDatabase'
                        inputSchema = 'public'
                        includes = '.*'
                        excludes = 'flyway_schema_history'
                    }
                    
                    target {
                        packageName = 'com.tandem.jooq'
                        directory = 'build/generated-sources/jooq'
                    }
                }
            }
        }
    }
}
```

### Generating jOOQ Code

**Prerequisites:**
1. PostgreSQL must be running (Docker container)
2. Migrations must have been applied

**Generate code:**

```bash
cd tandem-api

# Make sure database is running
docker compose up -d postgres

# Run migrations first
./gradlew bootRun
# (Ctrl+C after app starts)

# Generate jOOQ classes
./gradlew generateJooq
```

**Generated files location:**
```
build/generated-sources/jooq/
└── com/tandem/jooq/
    ├── tables/
    │   ├── Users.java
    │   ├── Households.java
    │   └── Cards.java
    ├── tables/records/
    │   ├── UsersRecord.java
    │   ├── HouseholdsRecord.java
    │   └── CardsRecord.java
    ├── tables/pojos/
    │   ├── Users.java (POJO)
    │   ├── Households.java (POJO)
    │   └── Cards.java (POJO)
    └── tables/daos/
        ├── UsersDao.java
        ├── HouseholdsDao.java
        └── CardsDao.java
```

### IDE Integration

**IntelliJ IDEA:**

After generation, refresh Gradle:
1. Right-click on project → "Reload Gradle Project"
2. Or: Gradle panel → Refresh button

The generated sources should now be available with full autocomplete!

## Using jOOQ

### Basic Setup - Inject DSLContext

```java
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import static com.tandem.jooq.tables.Users.USERS;
import static com.tandem.jooq.tables.Households.HOUSEHOLDS;

@Service
public class UserService {
    
    private final DSLContext dsl;
    
    public UserService(DSLContext dsl) {
        this.dsl = dsl;
    }
}
```

### Examples

#### 1. Simple SELECT

```java
// Find user by email
public Optional<UsersRecord> findByEmail(String email) {
    return dsl.selectFrom(USERS)
        .where(USERS.EMAIL.eq(email))
        .fetchOptional();
}

// Get all users
public List<UsersRecord> findAll() {
    return dsl.selectFrom(USERS)
        .orderBy(USERS.CREATED_AT.desc())
        .fetch();
}
```

#### 2. SELECT with JOINs

```java
// Get users with their household info
public List<Map<String, Object>> getUsersWithHouseholds() {
    return dsl.select(
            USERS.ID,
            USERS.EMAIL,
            USERS.FIRST_NAME,
            USERS.LAST_NAME,
            HOUSEHOLDS.NAME.as("household_name")
        )
        .from(USERS)
        .leftJoin(HOUSEHOLDS)
            .on(USERS.HOUSEHOLD_ID.eq(HOUSEHOLDS.ID))
        .fetch()
        .intoMaps();
}

// Using POJOs
public class UserWithHousehold {
    private Long userId;
    private String email;
    private String firstName;
    private String householdName;
    // getters/setters
}

public List<UserWithHousehold> getUsersWithHouseholdsPojo() {
    return dsl.select(
            USERS.ID.as("userId"),
            USERS.EMAIL,
            USERS.FIRST_NAME.as("firstName"),
            HOUSEHOLDS.NAME.as("householdName")
        )
        .from(USERS)
        .leftJoin(HOUSEHOLDS)
            .on(USERS.HOUSEHOLD_ID.eq(HOUSEHOLDS.ID))
        .fetchInto(UserWithHousehold.class);
}
```

#### 3. Dynamic Filtering (Complex Queries)

```java
public List<UsersRecord> searchUsers(
        String email,
        String firstName,
        Long householdId,
        LocalDateTime createdAfter) {
    
    var query = dsl.selectFrom(USERS);
    
    // Build conditions dynamically
    List<Condition> conditions = new ArrayList<>();
    
    if (email != null) {
        conditions.add(USERS.EMAIL.eq(email));
    }
    if (firstName != null) {
        conditions.add(USERS.FIRST_NAME.likeIgnoreCase("%" + firstName + "%"));
    }
    if (householdId != null) {
        conditions.add(USERS.HOUSEHOLD_ID.eq(householdId));
    }
    if (createdAfter != null) {
        conditions.add(USERS.CREATED_AT.ge(createdAfter));
    }
    
    // Apply all conditions
    if (!conditions.isEmpty()) {
        query.where(conditions);
    }
    
    return query.orderBy(USERS.CREATED_AT.desc())
        .fetch();
}
```

#### 4. INSERT

```java
public UsersRecord createUser(String email, String firstName, String lastName) {
    return dsl.insertInto(USERS)
        .set(USERS.EMAIL, email)
        .set(USERS.FIRST_NAME, firstName)
        .set(USERS.LAST_NAME, lastName)
        .set(USERS.CREATED_AT, LocalDateTime.now())
        .returning()
        .fetchOne();
}

// Using Record
public UsersRecord createUserWithRecord(UsersRecord user) {
    user.setCreatedAt(LocalDateTime.now());
    user.store(); // INSERT or UPDATE
    return user;
}
```

#### 5. UPDATE

```java
public int updateUserName(Long userId, String firstName, String lastName) {
    return dsl.update(USERS)
        .set(USERS.FIRST_NAME, firstName)
        .set(USERS.LAST_NAME, lastName)
        .set(USERS.UPDATED_AT, LocalDateTime.now())
        .where(USERS.ID.eq(userId))
        .execute();
}
```

#### 6. DELETE

```java
public int deleteUser(Long userId) {
    return dsl.deleteFrom(USERS)
        .where(USERS.ID.eq(userId))
        .execute();
}
```

#### 7. Aggregations & GROUP BY

```java
// Count users per household
public class HouseholdStats {
    private Long householdId;
    private String householdName;
    private Integer userCount;
    // getters/setters/constructor
}

public List<HouseholdStats> getHouseholdStats() {
    return dsl.select(
            HOUSEHOLDS.ID,
            HOUSEHOLDS.NAME,
            DSL.count(USERS.ID).as("user_count")
        )
        .from(HOUSEHOLDS)
        .leftJoin(USERS)
            .on(USERS.HOUSEHOLD_ID.eq(HOUSEHOLDS.ID))
        .groupBy(HOUSEHOLDS.ID, HOUSEHOLDS.NAME)
        .having(DSL.count(USERS.ID).gt(0))
        .fetchInto(HouseholdStats.class);
}
```

#### 8. Transactions

```java
@Transactional
public void transferUserToHousehold(Long userId, Long newHouseholdId) {
    dsl.transaction(config -> {
        DSLContext txDsl = DSL.using(config);
        
        // Update user
        txDsl.update(USERS)
            .set(USERS.HOUSEHOLD_ID, newHouseholdId)
            .where(USERS.ID.eq(userId))
            .execute();
        
        // Log the change (example)
        // ... other operations
    });
}
```

#### 9. Pagination

```java
public class PagedResult<T> {
    private List<T> items;
    private long total;
    private int page;
    private int pageSize;
    // getters/setters/constructor
}

public PagedResult<UsersRecord> findUsersPageinated(int page, int pageSize) {
    // Get total count
    long total = dsl.selectCount()
        .from(USERS)
        .fetchOne(0, long.class);
    
    // Get page
    List<UsersRecord> items = dsl.selectFrom(USERS)
        .orderBy(USERS.CREATED_AT.desc())
        .limit(pageSize)
        .offset(page * pageSize)
        .fetch();
    
    return new PagedResult<>(items, total, page, pageSize);
}
```

### Complete Service Example

```java
package com.tandem.service;

import com.tandem.jooq.tables.records.UsersRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.tandem.jooq.tables.Users.USERS;

@Service
@Transactional
public class UserService {
    
    private final DSLContext dsl;
    
    public UserService(DSLContext dsl) {
        this.dsl = dsl;
    }
    
    public Optional<UsersRecord> findById(Long id) {
        return dsl.selectFrom(USERS)
            .where(USERS.ID.eq(id))
            .fetchOptional();
    }
    
    public Optional<UsersRecord> findByEmail(String email) {
        return dsl.selectFrom(USERS)
            .where(USERS.EMAIL.eq(email))
            .fetchOptional();
    }
    
    public List<UsersRecord> findByHouseholdId(Long householdId) {
        return dsl.selectFrom(USERS)
            .where(USERS.HOUSEHOLD_ID.eq(householdId))
            .orderBy(USERS.FIRST_NAME, USERS.LAST_NAME)
            .fetch();
    }
    
    public UsersRecord create(String email, String firstName, String lastName) {
        return dsl.insertInto(USERS)
            .set(USERS.EMAIL, email)
            .set(USERS.FIRST_NAME, firstName)
            .set(USERS.LAST_NAME, lastName)
            .set(USERS.CREATED_AT, LocalDateTime.now())
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .returning()
            .fetchOne();
    }
    
    public void update(UsersRecord user) {
        user.setUpdatedAt(LocalDateTime.now());
        user.store();
    }
    
    public void delete(Long id) {
        dsl.deleteFrom(USERS)
            .where(USERS.ID.eq(id))
            .execute();
    }
}
```

## Best Practices

### 1. Use Static Imports

```java
import static com.tandem.jooq.tables.Users.USERS;
import static com.tandem.jooq.tables.Households.HOUSEHOLDS;
import static org.jooq.impl.DSL.*;
```

### 2. Reusable Conditions

```java
public class UserConditions {
    public static Condition hasEmail(String email) {
        return email == null ? noCondition() : USERS.EMAIL.eq(email);
    }
    
    public static Condition inHousehold(Long householdId) {
        return householdId == null ? noCondition() : USERS.HOUSEHOLD_ID.eq(householdId);
    }
}

// Usage
dsl.selectFrom(USERS)
    .where(hasEmail(email))
    .and(inHousehold(householdId))
    .fetch();
```

### 3. DTOs for Complex Queries

```java
// Don't do this:
List<Map<String, Object>> results = dsl.select(...)fetch().intoMaps();

// Do this:
@Data
public class UserDTO {
    private Long id;
    private String email;
    private String householdName;
}

List<UserDTO> results = dsl.select(...)fetchInto(UserDTO.class);
```

### 4. Keep Migrations Small

One logical change per migration file.

✅ Good:
- `V2__add_cards_table.sql`
- `V3__add_user_roles_table.sql`
- `V4__add_indexes_to_cards.sql`

❌ Bad:
- `V2__add_all_new_features.sql` (too big)

## Troubleshooting

### jOOQ classes not generated

```bash
# 1. Ensure database is running
docker compose ps postgres

# 2. Ensure migrations ran
./gradlew bootRun
# (wait for app to start, then Ctrl+C)

# 3. Manually generate jOOQ
./gradlew clean generateJooq

# 4. Refresh IntelliJ
Right-click project → Reload Gradle Project
```

### "Table doesn't exist" error

Make sure Flyway migrations ran:
```bash
docker compose exec postgres psql -U tandem -d tandemdb -c "\dt"
```

### Import errors in IDE

1. Refresh Gradle project
2. Rebuild project (Build → Rebuild Project)
3. Invalidate caches (File → Invalidate Caches / Restart)

### Migration checksum mismatch

```
ERROR: Migration checksum mismatch for migration V1__users.sql
```

You modified an already-applied migration. Options:

**Option 1: Repair (Development only)**
```bash
# Drop and recreate database
docker compose down -v
docker compose up -d postgres
./gradlew bootRun
```

**Option 2: Create new migration**
Create a new migration file with the changes.

### Connection refused during jOOQ generation

Make sure PostgreSQL is running:
```bash
docker compose up -d postgres
docker compose logs postgres
```

Wait for: `database system is ready to accept connections`

## Additional Resources

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [jOOQ Manual](https://www.jooq.org/doc/latest/manual/)
- [jOOQ with Spring Boot](https://www.jooq.org/doc/latest/manual/getting-started/jooq-and-spring/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Quick Reference

### Common Commands

```bash
# Start database
docker compose up -d postgres

# Run migrations
./gradlew bootRun

# Generate jOOQ classes
./gradlew generateJooq

# Connect to database
docker compose exec postgres psql -U tandem -d tandemdb

# View migration history
docker compose exec postgres psql -U tandem -d tandemdb -c "SELECT * FROM flyway_schema_history;"

# Check tables
docker compose exec postgres psql -U tandem -d tandemdb -c "\dt"

# Reset database (WARNING: deletes data)
docker compose down -v && docker compose up -d
```

### Workflow

1. Create migration file: `V{n}__{description}.sql`
2. Start database: `docker compose up -d`
3. Run app (migrations auto-apply): `./gradlew bootRun`
4. Generate jOOQ: `./gradlew generateJooq`
5. Write code with type-safe queries! 🎉


