package com.tandem.auth;

import com.tandem.auth.dto.LoginRequest;
import com.tandem.auth.dto.LoginResponse;
import com.tandem.auth.dto.ResendVerificationRequest;
import com.tandem.auth.dto.ResendVerificationResponse;
import com.tandem.auth.dto.SignUpRequest;
import com.tandem.auth.dto.SignUpResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final Auth0AuthenticationService authenticationService;

    public AuthController(Auth0AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signup(@Valid @RequestBody SignUpRequest request) {
        SignUpResponse response = authenticationService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ResendVerificationResponse> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        ResendVerificationResponse response = authenticationService.resendVerification(request);
        return ResponseEntity.ok(response);
    }
}
