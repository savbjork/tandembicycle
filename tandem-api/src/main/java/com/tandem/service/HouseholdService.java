package com.tandem.service;

import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static com.tandem.jooq.tables.Households.HOUSEHOLDS;

@Service
@Transactional
public class HouseholdService {

    private final DSLContext dsl;
    private final UserRepository userRepository;

    public HouseholdService(DSLContext dsl, UserRepository userRepository) {
        this.dsl = dsl;
        this.userRepository = userRepository;
    }

    public Integer createHouseholdForUser(String name, String auth0UserId) {
        Integer householdId = dsl.insertInto(HOUSEHOLDS)
            .set(HOUSEHOLDS.NAME, name)
            .set(HOUSEHOLDS.CREATED_AT, LocalDateTime.now())
            .set(HOUSEHOLDS.UPDATED_AT, LocalDateTime.now())
            .returningResult(HOUSEHOLDS.ID)
            .fetchOne(HOUSEHOLDS.ID);

        if (householdId == null) {
            throw new IllegalStateException("Failed to create household");
        }

        userRepository.findByAuth0Id(auth0UserId)
            .ifPresentOrElse(userRecord -> {
                userRecord.setHouseholdId(householdId);
                userRepository.update(userRecord);
            }, () -> {
                throw new IllegalStateException("User not found for Auth0 id: " + auth0UserId);
            });

        return householdId;
    }
}
