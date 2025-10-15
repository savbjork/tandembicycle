package com.tandem.auth;

import jakarta.validation.constraints.NotBlank;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "auth0")
public record Auth0Properties(
        @NotBlank(message = "Auth0 domain must be provided") String domain,
        @NotBlank(message = "Auth0 clientId must be provided") String clientId,
        @NotBlank(message = "Auth0 clientSecret must be provided") String clientSecret,
        @NotBlank(message = "Auth0 audience must be provided") String audience,
        @NotBlank(message = "Auth0 realm/database connection must be provided") String realm,
        String scope
) {
    public String baseUrl() {
        String sanitized = domain.strip();
        if (!sanitized.startsWith("http")) {
            sanitized = "https://" + sanitized;
        }
        while (sanitized.endsWith("/")) {
            sanitized = sanitized.substring(0, sanitized.length() - 1);
        }
        return sanitized;
    }

    public String tokenPath() {
        return "/oauth/token";
    }

    public String resolvedScope() {
        return (scope == null || scope.isBlank())
                ? "openid profile email offline_access"
                : scope;
    }
}
