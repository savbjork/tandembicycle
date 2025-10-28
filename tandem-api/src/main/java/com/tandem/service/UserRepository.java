package com.tandem.service;

import com.tandem.jooq.tables.records.UsersRecord;
import com.tandem.model.User;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.tandem.jooq.tables.Users.USERS;

/**
 * User service using jOOQ for type-safe SQL queries
 */
@Service
@Transactional
public class UserRepository {

    private final DSLContext dsl;
    public static final Field<String> AUTH0_ID_FIELD = USERS.field("auth0_id", String.class);

    public UserRepository(DSLContext dsl) {
        this.dsl = dsl;
    }
    
    /**
     * Find user by ID
     */
    public Optional<UsersRecord> findById(Integer id) {
        return dsl.selectFrom(USERS)
            .where(USERS.ID.eq(id))
            .fetchOptional();
    }
    
    /**
     * Find user by email
     */
    public Optional<UsersRecord> findByEmail(String email) {
        return dsl.selectFrom(USERS)
            .where(USERS.EMAIL.eq(email))
            .fetchOptional();
    }

    /**
     * Find user by Auth0 subject identifier
     */
    public Optional<UsersRecord> findByAuth0Id(String auth0Id) {
        return dsl.selectFrom(USERS)
            .where(AUTH0_ID_FIELD.eq(auth0Id))
            .fetchOptional();
    }
    
    /**
     * Get all users
     */
    public List<UsersRecord> findAll() {
        return dsl.selectFrom(USERS)
            .orderBy(USERS.CREATED_AT.desc())
            .fetch();
    }
    
    /**
     * Get users by household ID
     */
    public List<UsersRecord> findByHouseholdId(Integer householdId) {
        return dsl.selectFrom(USERS)
            .where(USERS.HOUSEHOLD_ID.eq(householdId))
            .orderBy(USERS.FIRST_NAME, USERS.LAST_NAME)
            .fetch();
    }
    
    /**
     * Create a new user
     */
    public UsersRecord createUser(User user) {
        return dsl.insertInto(USERS)
            .set(USERS.EMAIL, user.getEmail())
            .set(USERS.FIRST_NAME, user.getFirstName())
            .set(USERS.LAST_NAME, user.getLastName())
            .set(AUTH0_ID_FIELD, user.getAuth0Id())
            .set(USERS.CREATED_AT, LocalDateTime.now())
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .returning()
            .fetchOne();
    }

    public void attachAuth0Id(Integer userId, String auth0Id) {
        dsl.update(USERS)
            .set(AUTH0_ID_FIELD, auth0Id)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(userId))
            .execute();
    }
    
    /**
     * Update user
     */
    public void update(UsersRecord user) {
        user.setUpdatedAt(LocalDateTime.now());
        user.store();
    }
    
    /**
     * Delete user by ID
     */
    public int delete(Integer id) {
        return dsl.deleteFrom(USERS)
            .where(USERS.ID.eq(id))
            .execute();
    }
    
    /**
     * Count total users
     */
    public long count() {
        return dsl.selectCount()
            .from(USERS)
            .fetchOne(0, long.class);
    }

    public void markEmailAsVerified(String email) {
        dsl.update(USERS)
            .set(USERS.IS_EMAIL_VERIFIED, true)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.EMAIL.eq(email))
            .execute();
    }
}
