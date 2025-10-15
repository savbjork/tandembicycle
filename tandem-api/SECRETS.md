# Secure Secret Management for Tandem API

This backend never stores production secrets in source control. Spring Boot resolves sensitive settings from environment variables or an encrypted secrets file that is **always** ignored by git. The setup uses the Jasypt starter so you can encrypt individual values while keeping them close to the app for local use.

## Directory Layout

```
tandem-api/
├── application-secrets.example.properties   # template committed to git
└── .secrets/                                # ignored at VCS level
    └── application-secrets.properties       # real secrets (optional)
```

`application.properties` loads `.secrets/application-secrets.properties` first if it exists, then falls back to environment variables. You can therefore pick the strategy that suits each environment:

- **Local dev** – copy the example file into `.secrets/`, fill in values (optionally encrypted), keep the encryption password in your shell profile.
- **CI / production** – supply secrets via environment variables or your orchestrator’s secret injection (Kubernetes secrets, AWS/GCP secret managers, Doppler, Vault, etc.).

## Encrypting Fields with Jasypt

1. Choose a strong password (min 32 random characters). Share it securely with the platform that runs the app. Never commit it.
2. Export the password before running any Spring command:

   ```bash
   export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="<your-strong-password>"
   ```

3. Encrypt a value using the Gradle task:

   ```bash
   ./gradlew encryptProperty -Pvalue="super-secret"
   ```

   The command prints the encrypted value. Copy the value **including** the `ENC(...)` wrapper.
   
   Alternatively, you can use the shell script:
   
   ```bash
   ./encrypt-property.sh "super-secret"
   ```

4. Replace the plaintext value in `.secrets/application-secrets.properties` with the `ENC(...)` token. Spring Boot automatically decrypts it at runtime.

5. On production hosts, set the same `JASYPT_TANDEM_ENCRYPTOR_PASSWORD` as an environment variable so the process can decrypt the values.

## Required Variables

| Property | Description | Source |
|----------|-------------|--------|
| `AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `https://acme.eu.auth0.com`) | env or secrets file |
| `AUTH0_CLIENT_ID` | Native application client id | env or secrets file |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | **encrypt this** |
| `AUTH0_AUDIENCE` | API audience identifier | env or secrets file |
| `AUTH0_REALM` | Auth0 connection/realm (defaults to `Username-Password-Authentication`) | optional |
| `SPRING_DATASOURCE_URL` | JDBC URL | env or secrets file |
| `SPRING_DATASOURCE_USERNAME` | Database username | **encrypt if stored in file** |
| `SPRING_DATASOURCE_PASSWORD` | Database password | **encrypt if stored in file** |

Any other Spring property can also live in the secrets file – it obeys standard Spring Boot property precedence.

## Deployment Checklist

1. Provision secrets in your platform’s secret manager or `.secrets/application-secrets.properties` (encrypted).
2. Set `JASYPT_TANDEM_ENCRYPTOR_PASSWORD` for any environment where encrypted values are present.
3. Ensure your CI/CD pipeline never echoes the secret values (`set +x` or masked variables).
4. Run `./gradlew bootRun` or the container entrypoint – the application will fail fast if required secrets are missing because `Auth0Properties` is validated on startup.
5. Rotate the encryption password and the encrypted values periodically. Because secrets are externalized, you can rotate without code changes.

## Example: Local Bootstrap

```bash
# 1. Create the secrets directory and copy the example
mkdir -p .secrets
cp application-secrets.example.properties .secrets/application-secrets.properties

# 2. Generate and export a strong encryption password
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD=$(openssl rand -base64 48)
echo "Save this password: $JASYPT_TANDEM_ENCRYPTOR_PASSWORD"

# 3. Encrypt your secrets
./gradlew encryptProperty -Pvalue="your-auth0-secret"
# Copy the output (including ENC(...)) and paste into .secrets/application-secrets.properties

# 4. Start the services
docker compose up -d
./gradlew bootRun
```

With this structure the repository carries **no** production credentials, while developers and automation can still feed the runtime the values it needs securely.
