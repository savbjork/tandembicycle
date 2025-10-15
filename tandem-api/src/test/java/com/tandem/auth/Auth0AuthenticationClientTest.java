package com.tandem.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import com.tandem.auth.dto.Auth0TokenResponse;
import java.io.IOException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

class Auth0AuthenticationClientTest {

    private MockWebServer mockWebServer;
    private Auth0AuthenticationClient client;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        String baseUrl = mockWebServer.url("/").toString();
        Auth0Properties properties = new Auth0Properties(
                baseUrl,
                "client-id",
                "client-secret",
                "https://api.example.com",
                "Username-Password-Authentication",
                "openid profile email"
        );

        client = new Auth0AuthenticationClient(RestClient.builder(), properties);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void exchangeCredentialsReturnsTokensOnSuccess() throws InterruptedException {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          \"access_token\": \"access\",
                          \"id_token\": \"id\",
                          \"refresh_token\": \"refresh\",
                          \"expires_in\": 86400,
                          \"token_type\": \"Bearer\",
                          \"scope\": \"openid profile email\"
                        }
                        """));

        Auth0TokenResponse response = client.exchangeCredentials("user@example.com", "password123");

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.idToken()).isEqualTo("id");
        assertThat(response.refreshToken()).isEqualTo("refresh");
        assertThat(response.expiresIn()).isEqualTo(86400);
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.scope()).isEqualTo("openid profile email");

        RecordedRequest request = mockWebServer.takeRequest();
        assertThat(request.getPath()).isEqualTo("/oauth/token");
        assertThat(request.getMethod()).isEqualTo("POST");
        assertThat(request.getHeader("Content-Type")).contains("application/json");
        assertThat(request.getBody().readUtf8()).contains("\"grant_type\":\"http://auth0.com/oauth/grant-type/password-realm\"");
    }

    @Test
    void exchangeCredentialsThrowsInvalidCredentialsOn4xx() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(401)
                .setHeader("Content-Type", "application/json")
                .setBody("{\"error\":\"invalid_grant\"}"));

        assertThatThrownBy(() -> client.exchangeCredentials("user@example.com", "wrong"))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("rejected");
    }

    @Test
    void exchangeCredentialsThrowsAuth0ClientExceptionOnServerError() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        assertThatThrownBy(() -> client.exchangeCredentials("user@example.com", "password123"))
                .isInstanceOf(Auth0ClientException.class)
                .hasMessageContaining("unexpected error");
    }
}
