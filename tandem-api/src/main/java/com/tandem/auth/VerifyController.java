package com.tandem.auth;

import com.tandem.auth.dto.EmailVerificationRequest;
import com.tandem.auth.dto.EmailVerificationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Controller for handling email verification callbacks from Auth0
 */
@RestController
@RequestMapping("/api/auth")
public class VerifyController {

    /**
     * Endpoint called by Auth0 when a user verifies their email
     */
    @PostMapping("/verify")
    public ResponseEntity<EmailVerificationResponse> handleEmailVerification(
            @RequestBody EmailVerificationRequest request) {
        
        try {
            // Log the verification
            System.out.println("Email verification received for user: " + request.userId());
            System.out.println("Email: " + request.email());
            System.out.println("Verified: " + request.emailVerified());
            System.out.println("Timestamp: " + request.timestamp());
            
            // Here you can:
            // 1. Update user status in your database
            // 2. Send welcome email
            // 3. Update user permissions
            // 4. Log the verification event
            
            // Example: Update user verification status
            // userService.markEmailAsVerified(request.userId());
            
            return ResponseEntity.ok(new EmailVerificationResponse(
                "Email verification processed successfully",
                LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            System.err.println("Error processing email verification: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(new EmailVerificationResponse(
                    "Error processing verification",
                    LocalDateTime.now()
                ));
        }
    }
}


