package com.tandem.auth;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.tandem.auth.dto.Auth0LogEvent;
import com.tandem.auth.dto.Auth0TokenResponse;
import com.tandem.auth.dto.LoginRequest;
import com.tandem.auth.dto.LoginResponse;
import com.tandem.auth.dto.ResendVerificationRequest;
import com.tandem.auth.dto.ResendVerificationResponse;
import com.tandem.auth.dto.SignUpRequest;
import com.tandem.auth.dto.SignUpResponse;
import com.tandem.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.text.ParseException;

@Service
public class Auth0AuthenticationService {

    private final Auth0AuthenticationClient auth0Client;
    private final UserService userService;

    public Auth0AuthenticationService(Auth0AuthenticationClient auth0Client, UserService userService) {
        this.auth0Client = auth0Client;
        this.userService = userService;
    }

    public LoginResponse login(LoginRequest request) {
        Auth0TokenResponse tokenResponse = auth0Client.exchangeCredentials(request.email(), request.password());
        linkUserToAuth0Record(tokenResponse);
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
        SignUpResponse response = auth0Client.signUp(request);
        //this won't hit if signup is unsuccessful
        if (response == null || !StringUtils.hasText(response.id())) {
            throw new IllegalStateException("Auth0 signup did not return a user identifier");
        }
        userService.createUser(request, response.id());
        return response;
    }

    private void linkUserToAuth0Record(Auth0TokenResponse tokenResponse) {
        if (tokenResponse == null || !StringUtils.hasText(tokenResponse.idToken())) {
            return;
        }

        try {
            SignedJWT signedJWT = SignedJWT.parse(tokenResponse.idToken());
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            String auth0UserId = claims.getSubject();
            String email = claims.getStringClaim("email");
            userService.linkUserToAuth0(auth0UserId, email);
        } catch (ParseException e) {
            throw new Auth0ClientException("Unable to parse Auth0 ID token", e);
        }
    }

    public ResendVerificationResponse resendVerification(ResendVerificationRequest request) {
        auth0Client.resendVerificationEmail(request.email());
        return new ResendVerificationResponse("Verification email sent. Please check your inbox.");
    }

    public void handleUserVerified(Auth0LogEvent event) {
        if (event == null || !"sv".equalsIgnoreCase(event.type())) {
            return;
        }

        String email = null;
        if (event.details() != null && StringUtils.hasText(event.details().email())) {
            email = event.details().email();
        } else if (StringUtils.hasText(event.userName())) {
            email = event.userName();
        }

        userService.verifyUserEmail(email);
    }
}
