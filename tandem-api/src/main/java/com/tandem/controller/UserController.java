package com.tandem.controller;

import com.tandem.model.User;
import com.tandem.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/v1/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public User getUser(
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "email", required = false) String email,
            @AuthenticationPrincipal Jwt jwt) {
        if (userId != null && StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specify either userId or email, not both");
        }

        if (userId != null) {
            return userService.getUserInfoById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        if (StringUtils.hasText(email)) {
            return userService.getUserInfoByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        String auth0UserId = Optional.ofNullable(jwt)
            .map(Jwt::getSubject)
            .filter(StringUtils::hasText)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user"));

        return userService.getCurrentUserInfo(auth0UserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
