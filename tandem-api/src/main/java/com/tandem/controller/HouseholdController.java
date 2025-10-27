package com.tandem.controller;

import com.tandem.service.HouseholdService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/v1/households")
public class HouseholdController {
    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @PostMapping("/create")
    public Map<String, Integer> createHousehold(
            @Valid @RequestBody CreateHouseholdRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String householdName = request.name().trim();
        String auth0UserId = jwt.getSubject();

        if (auth0UserId == null || auth0UserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authenticated user identifier missing");
        }

        Integer householdId = householdService.createHouseholdForUser(householdName, auth0UserId);
        return Map.of("id", householdId);
    }

    public record CreateHouseholdRequest(@NotBlank String name) {
    }
}
