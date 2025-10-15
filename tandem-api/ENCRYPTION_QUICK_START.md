# Property Encryption Quick Start

This guide shows you how to encrypt sensitive values in `application.properties` using Jasypt.

## Prerequisites

✅ Jasypt is already configured in your project!

## Quick Steps

### 1. Set Your Encryption Password

Choose a strong password and set it as an environment variable:

```bash
# Generate a secure password (save this!)
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD=$(openssl rand -base64 48)

# Or use your own password
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-super-secret-master-password"
```

**Important:** Save this password securely! You'll need it on every machine/environment that runs the app.

### 2. Encrypt a Value

**Option A: Using Gradle with environment variable**

```bash
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-master-password"
./gradlew encryptProperty -Pvalue="my-secret-value"
```

**Option B: Using Gradle with password parameter (no env var needed)**

```bash
./gradlew encryptProperty -Pvalue="my-secret-value" -Ppassword="your-master-password"
```

**Option C: Using the shell script**

```bash
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-master-password"
./encrypt-property.sh "my-secret-value"
```

Both commands will output something like:

```
==============================================
Original value: my-secret-value
Encrypted value: xI8pF3Kd9sL2mN7vB4wQ1...
Use in application.properties as:
property.name=ENC(xI8pF3Kd9sL2mN7vB4wQ1...)
==============================================
```

### 3. Use the Encrypted Value

Copy the entire `ENC(...)` string (including the prefix and parentheses) and paste it into your properties file:

**In `.secrets/application-secrets.properties`:**

```properties
# Plaintext (not recommended for secrets)
auth0.client-secret=my-actual-secret

# Encrypted (recommended!)
auth0.client-secret=ENC(xI8pF3Kd9sL2mN7vB4wQ1...)
```

### 4. Run Your Application

Make sure the `JASYPT_TANDEM_ENCRYPTOR_PASSWORD` environment variable is set before starting:

```bash
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-master-password"
./gradlew bootRun
```

Or for Docker:

```bash
docker compose up -d
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-master-password"
./gradlew bootRun
```

## Examples

### Encrypt Auth0 Client Secret

**Using environment variable:**
```bash
export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="my-master-password"
./gradlew encryptProperty -Pvalue="abc123XYZ_your-auth0-secret"
```

**Or pass password directly (simpler for one-off use):**
```bash
./gradlew encryptProperty -Pvalue="abc123XYZ_your-auth0-secret" -Ppassword="my-master-password"
```

Copy the output and update `.secrets/application-secrets.properties`:

```properties
auth0.client-secret=ENC(h8J2kL9mP3nQ6rS1tU4vW7xY0zA...)
```

### Encrypt Database Password

```bash
# With env var already set
./gradlew encryptProperty -Pvalue="postgres_prod_password"

# Or directly with password
./gradlew encryptProperty -Pvalue="postgres_prod_password" -Ppassword="my-master-password"
```

Update your properties:

```properties
spring.datasource.password=ENC(b2C5dE8fG1hI4jK7lM0nO3pQ6rS...)
```

## How It Works

1. **At Encryption Time:** Your plaintext secret is encrypted using the `JASYPT_TANDEM_ENCRYPTOR_PASSWORD`
2. **At Runtime:** Spring Boot automatically detects `ENC(...)` values and decrypts them using the same password
3. **In Memory:** The decrypted value is used by your application

## Deployment

### Local Development

1. Create `.secrets/application-secrets.properties` (git-ignored)
2. Add encrypted values
3. Export `JASYPT_TANDEM_ENCRYPTOR_PASSWORD` in your `.zshrc` or `.bashrc`:
   ```bash
   export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-local-dev-password"
   ```

### Production/CI

**Option A: Environment Variables** (Recommended)

Set both the secrets and the encryption password as environment variables:

```bash
export AUTH0_CLIENT_SECRET="plaintext-secret"  # No ENC() needed
export SPRING_DATASOURCE_PASSWORD="plaintext-password"
# Encryption password not needed if using plaintext env vars
```

**Option B: Encrypted Properties File**

1. Deploy `.secrets/application-secrets.properties` with encrypted values
2. Set `JASYPT_TANDEM_ENCRYPTOR_PASSWORD` as an environment variable in your deployment platform:
   - Kubernetes: Use secrets
   - AWS: Use Systems Manager Parameter Store or Secrets Manager
   - Docker: Pass via `-e` or `docker-compose.yml`
   - Heroku: Set as config var

## Troubleshooting

### "Unable to decrypt"

- ❌ Wrong password: Make sure `JASYPT_TANDEM_ENCRYPTOR_PASSWORD` matches the one used for encryption
- ❌ Missing password: Ensure the environment variable is set before starting the app
- ❌ Corrupted encrypted value: Re-encrypt the value

### Password not found

```bash
Error: JASYPT_TANDEM_ENCRYPTOR_PASSWORD environment variable is not set
```

**Solution:** Run `export JASYPT_TANDEM_ENCRYPTOR_PASSWORD="your-password"` before starting the app

### Check if a value is encrypted

Encrypted values in properties files always follow this pattern:
```
property.name=ENC(base64-looking-string...)
```

## Best Practices

✅ **DO:**
- Use a strong, random encryption password (min 32 characters)
- Store the encryption password in a secure secret manager
- Encrypt all sensitive values (passwords, API keys, tokens)
- Use different encryption passwords for dev/staging/prod
- Rotate encryption passwords periodically

❌ **DON'T:**
- Commit the encryption password to git
- Use the same password across all environments
- Hard-code secrets in `application.properties`
- Share the encryption password via email/Slack

## Alternative: Using Environment Variables Only

If you prefer not to use encryption, you can rely solely on environment variables:

```properties
# application.properties
auth0.client-secret=${AUTH0_CLIENT_SECRET:REPLACE_ME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:default}
```

Then set environment variables:

```bash
export AUTH0_CLIENT_SECRET="my-secret"
export SPRING_DATASOURCE_PASSWORD="my-password"
./gradlew bootRun
```

This approach is simpler but requires your deployment platform to securely manage environment variables.

## More Information

See [SECRETS.md](./SECRETS.md) for comprehensive secret management documentation.

