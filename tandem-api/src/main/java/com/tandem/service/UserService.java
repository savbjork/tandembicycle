package com.tandem.service;

import com.tandem.auth.dto.SignUpRequest;
import com.tandem.model.User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void createUser(SignUpRequest request, String auth0UserId) {
        if (!StringUtils.hasText(auth0UserId)) {
            throw new IllegalArgumentException("Auth0 user id is required to create a user");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setFirstName(resolveFirstName(request));
        user.setLastName(resolveLastName(request));
        user.setAuth0Id(auth0UserId);
        userRepository.createUser(user);
    }

    public void linkUserToAuth0(String auth0UserId, String email) {
        if (!StringUtils.hasText(auth0UserId)) {
            return;
        }

        if (userRepository.findByAuth0Id(auth0UserId).isPresent()) {
            return;
        }

        if (!StringUtils.hasText(email)) {
            return;
        }

        userRepository.findByEmail(email)
            .ifPresent(userRecord -> userRepository.attachAuth0Id(userRecord.getId(), auth0UserId));
    }

    private String resolveFirstName(SignUpRequest request) {
        if (StringUtils.hasText(request.firstName())) {
            return request.firstName();
        }
        return request.givenName();
    }

    private String resolveLastName(SignUpRequest request) {
        if (StringUtils.hasText(request.lastName())) {
            return request.lastName();
        }
        return request.familyName();
    }

    public void verifyUserEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return;
        }
        userRepository.markEmailAsVerified(email);
    }
}
