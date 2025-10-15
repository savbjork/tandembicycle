package com.tandem.auth;

public class Auth0ClientException extends RuntimeException {
    public Auth0ClientException(String message) {
        super(message);
    }

    public Auth0ClientException(String message, Throwable cause) {
        super(message, cause);
    }
}
