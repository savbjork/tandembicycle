package com.tandem.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.tandem.auth.dto.Auth0TokenResponse;
import com.tandem.auth.dto.LoginRequest;
import com.tandem.auth.dto.LoginResponse;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class Auth0AuthenticationServiceTest {

    @Test
    void loginDelegatesToAuth0ClientAndMapsResponse() {
        Auth0AuthenticationClient client = Mockito.mock(Auth0AuthenticationClient.class);
        Auth0AuthenticationService service = new Auth0AuthenticationService(client);

        Auth0TokenResponse tokenResponse = new Auth0TokenResponse(
                "access",
                7200,
                "Bearer",
                "id",
                "openid profile",
                "refresh"
        );

        when(client.exchangeCredentials("user@example.com", "password123")).thenReturn(tokenResponse);

        LoginResponse response = service.login(new LoginRequest("user@example.com", "password123"));

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.expiresIn()).isEqualTo(7200);
        assertThat(response.idToken()).isEqualTo("id");
        assertThat(response.refreshToken()).isEqualTo("refresh");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.scope()).isEqualTo("openid profile");
    }
}
