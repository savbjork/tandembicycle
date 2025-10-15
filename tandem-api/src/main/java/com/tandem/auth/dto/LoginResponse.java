package com.tandem.auth.dto;

public record LoginResponse(
        String accessToken,
        String idToken,
        String refreshToken,
        long expiresIn,
        String tokenType,
        String scope
) {
}
