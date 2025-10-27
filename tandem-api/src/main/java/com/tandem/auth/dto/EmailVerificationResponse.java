package com.tandem.auth.dto;

import java.time.LocalDateTime;

/**
 * Response DTO for email verification endpoint
 */
public record EmailVerificationResponse(
    String message,
    LocalDateTime timestamp
) {}


