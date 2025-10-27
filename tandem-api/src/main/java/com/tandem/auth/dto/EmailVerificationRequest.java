package com.tandem.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for email verification callback from Auth0
 */
public record EmailVerificationRequest(
    @JsonProperty("userId") String userId,
    @JsonProperty("email") String email,
    @JsonProperty("emailVerified") boolean emailVerified,
    @JsonProperty("timestamp") String timestamp
) {}


