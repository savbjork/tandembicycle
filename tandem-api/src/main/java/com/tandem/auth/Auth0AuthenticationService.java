package com.tandem.auth;

import com.tandem.auth.dto.Auth0TokenResponse;
import com.tandem.auth.dto.LoginRequest;
import com.tandem.auth.dto.LoginResponse;
import com.tandem.auth.dto.ResendVerificationRequest;
import com.tandem.auth.dto.ResendVerificationResponse;
import com.tandem.auth.dto.SignUpRequest;
import com.tandem.auth.dto.SignUpResponse;
import org.springframework.stereotype.Service;

@Service
public class Auth0AuthenticationService {

    private final Auth0AuthenticationClient auth0Client;

    public Auth0AuthenticationService(Auth0AuthenticationClient auth0Client) {
        this.auth0Client = auth0Client;
    }

    public LoginResponse login(LoginRequest request) {
        Auth0TokenResponse tokenResponse = auth0Client.exchangeCredentials(request.email(), request.password());
        return new LoginResponse(
                tokenResponse.accessToken(),
                tokenResponse.idToken(),
                tokenResponse.refreshToken(),
                tokenResponse.expiresIn(),
                tokenResponse.tokenType(),
                tokenResponse.scope()
        );
    }

    public SignUpResponse signup(SignUpRequest request) {
        return auth0Client.signUp(request);
    }

    public ResendVerificationResponse resendVerification(ResendVerificationRequest request) {
        auth0Client.resendVerificationEmail(request.email());
        return new ResendVerificationResponse("Verification email sent. Please check your inbox.");
    }
}
