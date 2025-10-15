package com.tandem.auth;

import com.tandem.auth.dto.Auth0TokenResponse;
import com.tandem.auth.dto.SignUpRequest;
import com.tandem.auth.dto.SignUpResponse;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Component
public class Auth0AuthenticationClient {

    private static final String PASSWORD_REALM_GRANT = "http://auth0.com/oauth/grant-type/password-realm";

    private final RestClient restClient;
    private final Auth0Properties properties;

    public Auth0AuthenticationClient(RestClient.Builder builder, Auth0Properties properties) {
        this.properties = properties;
        this.restClient = builder.baseUrl(properties.baseUrl()).build();
    }

    public Auth0TokenResponse exchangeCredentials(String email, String password) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("grant_type", PASSWORD_REALM_GRANT);
        payload.put("username", email);
        payload.put("password", password);
        payload.put("audience", properties.audience());
        payload.put("client_id", properties.clientId());
        payload.put("client_secret", properties.clientSecret());
        payload.put("realm", properties.realm());
        payload.put("scope", properties.resolvedScope());

        try {
            return restClient.post()
                    .uri(properties.tokenPath())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Auth0TokenResponse.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().is4xxClientError()) {
                String responseBody = ex.getResponseBodyAsString();
                
                // Check for specific Auth0 error codes
                if (responseBody.contains("\"error\":\"unauthorized\"")) {
                    if (responseBody.contains("email not verified") || 
                        responseBody.contains("Please verify your email")) {
                        throw new InvalidCredentialsException(
                            "Email not verified. Please check your email and click the verification link.", ex);
                    }
                    throw new InvalidCredentialsException("Invalid email or password", ex);
                } else if (responseBody.contains("\"error\":\"invalid_grant\"")) {
                    throw new InvalidCredentialsException("Invalid email or password", ex);
                }
                
                // Generic 4xx error
                throw new InvalidCredentialsException("Authentication failed: " + responseBody, ex);
            }
            throw new Auth0ClientException("Auth0 returned an unexpected error", ex);
        } catch (RestClientException ex) {
            throw new Auth0ClientException("Unable to reach Auth0 authentication service", ex);
        }
    }

    public SignUpResponse signUp(SignUpRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("client_id", properties.clientId());
        payload.put("email", request.email());
        payload.put("password", request.password());
        payload.put("connection", properties.realm());
        
        // Add optional fields if provided
        if (request.name() != null && !request.name().isBlank()) {
            payload.put("name", request.name());
        }
        if (request.givenName() != null && !request.givenName().isBlank()) {
            payload.put("given_name", request.givenName());
        }
        if (request.familyName() != null && !request.familyName().isBlank()) {
            payload.put("family_name", request.familyName());
        }

        try {
            return restClient.post()
                    .uri("/dbconnections/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(SignUpResponse.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().is4xxClientError()) {
                String errorMessage = "Signup failed: " + ex.getResponseBodyAsString();
                throw new InvalidCredentialsException(errorMessage, ex);
            }
            throw new Auth0ClientException("Auth0 returned an unexpected error during signup", ex);
        } catch (RestClientException ex) {
            throw new Auth0ClientException("Unable to reach Auth0 signup service", ex);
        }
    }

    public void resendVerificationEmail(String email) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("client_id", properties.clientId());
        payload.put("email", email);
        payload.put("connection", properties.realm());

        try {
            restClient.post()
                    .uri("/dbconnections/change_password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().is4xxClientError()) {
                String errorMessage = "Failed to resend verification email: " + ex.getResponseBodyAsString();
                throw new Auth0ClientException(errorMessage, ex);
            }
            throw new Auth0ClientException("Auth0 returned an unexpected error", ex);
        } catch (RestClientException ex) {
            throw new Auth0ClientException("Unable to reach Auth0 service", ex);
        }
    }
}
