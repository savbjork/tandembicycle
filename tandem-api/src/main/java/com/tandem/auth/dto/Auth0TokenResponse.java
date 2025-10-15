package com.tandem.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record Auth0TokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") long expiresIn,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("id_token") String idToken,
        @JsonProperty("scope") String scope,
        @JsonProperty("refresh_token") String refreshToken
) {
}
