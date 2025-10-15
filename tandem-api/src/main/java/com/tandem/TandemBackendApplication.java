package com.tandem;

import com.tandem.auth.Auth0Properties;
import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(Auth0Properties.class)
@EnableEncryptableProperties
public class TandemBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TandemBackendApplication.class, args);
	}

}
