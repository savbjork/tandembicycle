package com.tandem.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record Auth0LogEvent(
        String type,
        @JsonProperty("user_name") String userName,
        Details details
) {
    public record Details(
            String email
    ) {
    }
}

