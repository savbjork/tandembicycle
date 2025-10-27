package com.tandem.model;

import lombok.Data;

import java.util.Date;

@Data
public class User {
    private Integer Id;
    private String firstName;
    private String lastName;
    private String email;
    private String auth0Id;
    private Date createdAt;
    private Date updatedAt;
}
