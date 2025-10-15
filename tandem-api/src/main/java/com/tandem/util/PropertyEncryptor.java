package com.tandem.util;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.iv.RandomIvGenerator;

/**
 * Utility to encrypt values for use in application.properties
 * 
 * Usage:
 * 1. Set your encryption password as an environment variable:
 *    export JASYPT_TANDEM_ENCRYPTOR_PASSWORD=your-master-password
 * 
 * 2. Run this class with the value you want to encrypt as an argument:
 *    ./gradlew encryptProperty -Pvalue="my-secret-value"
 * 
 * 3. Copy the output (without ENC()) and use it in application.properties as:
 *    property.name=ENC(encrypted_value_here)
 */
public class PropertyEncryptor {
    
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java PropertyEncryptor <value-to-encrypt> [encryption-password]");
            System.err.println("Or set JASYPT_TANDEM_ENCRYPTOR_PASSWORD environment variable");
            System.exit(1);
        }
        
        String valueToEncrypt = args[0];
        
        // Get password from args or environment variable
        String password;
        if (args.length >= 2) {
            password = args[1];
        } else {
            password = System.getenv("JASYPT_TANDEM_ENCRYPTOR_PASSWORD");
            if (password == null || password.isEmpty()) {
                System.err.println("Error: JASYPT_TANDEM_ENCRYPTOR_PASSWORD environment variable is not set");
                System.err.println("Alternatively, pass the password as the second argument");
                System.exit(1);
            }
        }
        
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword(password);
        encryptor.setAlgorithm("PBEWithHMACSHA512AndAES_256");
        encryptor.setIvGenerator(new RandomIvGenerator());
        
        String encrypted = encryptor.encrypt(valueToEncrypt);
        
        System.out.println("\n==============================================");
        System.out.println("Original value: " + valueToEncrypt);
        System.out.println("Encrypted value: " + encrypted);
        System.out.println("\nUse in application.properties as:");
        System.out.println("property.name=ENC(" + encrypted + ")");
        System.out.println("==============================================\n");
    }
}

