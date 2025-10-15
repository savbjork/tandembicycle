#!/bin/bash

# Script to encrypt a property value for use in application.properties
# Usage: ./encrypt-property.sh "your-secret-value"

if [ -z "$1" ]; then
    echo "Usage: ./encrypt-property.sh <value-to-encrypt>"
    echo "Example: ./encrypt-property.sh 'my-secret-password'"
    exit 1
fi

if [ -z "$JASYPT_TANDEM_ENCRYPTOR_PASSWORD" ]; then
    echo "Error: JASYPT_TANDEM_ENCRYPTOR_PASSWORD environment variable is not set"
    echo "Set it with: export JASYPT_TANDEM_ENCRYPTOR_PASSWORD=your-master-password"
    exit 1
fi

cd "$(dirname "$0")"

# Compile and run the encryptor
./gradlew --quiet compileJava
java -cp "build/classes/java/main:$(./gradlew --quiet printClasspath)" \
    com.tandem.util.PropertyEncryptor "$1"

