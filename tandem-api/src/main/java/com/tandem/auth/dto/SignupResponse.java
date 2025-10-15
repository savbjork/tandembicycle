package com.tandem.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SignUpResponse(
        @JsonProperty("_id")
        String id,

        String email,

        @JsonProperty("email_verified")
        Boolean emailVerified,

        String username,

        String name,

        @JsonProperty("given_name")
        String givenName,

        @JsonProperty("family_name")
        String familyName,

        String nickname,

        String picture,

        @JsonProperty("created_at")
        String createdAt,

        @JsonProperty("updated_at")
        String updatedAt
) {
}
