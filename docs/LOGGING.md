# Logging System Documentation

This application uses **Pino** for structured logging, providing high-performance, JSON-based logging with support for multiple environments.

## Overview

The logging system consists of:

- **lib/logger.ts** - Main logger instance and helper functions
- **lib/logger-config.ts** - Configuration and log rotation settings
- **lib/logger-middleware.ts** - Middleware for request/response logging

## Quick Start

### Basic Usage

```typescript
import { logger } from "@/lib/logger";

// Simple logging
logger.info("Server started");
logger.error("Something went wrong");

// Structured logging
logger.info({ msg: "User created", userId: "123", email: "user@example.com" });
```

### API Route Logging

```typescript
import { createApiLogger } from "@/lib/logger";

export async function GET(request: Request) {
  const logger = createApiLogger(
    "GET",
    "/api/users",
    session.user.id,
    organizationId,
  );

  try {
    logger.info({ msg: "Fetching users" });
    const users = await fetchUsers();
    logger.info({ msg: "Users fetched successfully", count: users.length });
    return NextResponse.json({ users });
  } catch (error) {
    logger.error({
      msg: "Error fetching users",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

## Logger Types

### 1. createApiLogger(method, path, userId?, organizationId?)

For API routes and request handlers.

```typescript
const logger = createApiLogger("POST", "/api/documents", userId, orgId);
logger.info({ msg: "Document uploaded", documentId, fileName });
```

### 2. createDbLogger(operation, table)

For database operations.

```typescript
const logger = createDbLogger("CREATE", "User");
logger.info({ msg: "User created", userId });
```

### 3. createAuthLogger(action)

For authentication operations.

```typescript
const logger = createAuthLogger("LOGIN");
logger.info({ msg: "User logged in", userId });
```

### 4. createFileLogger(operation)

For file system operations.

```typescript
const logger = createFileLogger("UPLOAD");
logger.info({ msg: "File uploaded", path, size });
```

### 5. createEmailLogger(action)

For email operations.

```typescript
const logger = createEmailLogger("SEND");
logger.info({ msg: "Email sent", to, subject });
```

### 6. createAuditLogger(userId, organizationId, action)

For audit trail logging.

```typescript
const logger = createAuditLogger(userId, orgId, "DELETE_DOCUMENT");
logger.info({ msg: "Document deleted", documentId });
```

## Log Levels

Pino uses numeric log levels:

- **trace (10)**: Very detailed debugging information
- **debug (20)**: Debugging information
- **info (30)**: General informational messages
- **warn (40)**: Warning messages
- **error (50)**: Error messages
- **fatal (60)**: Critical errors causing shutdown

```typescript
logger.trace("Trace message");
logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");
logger.fatal("Fatal message");
```

## Structured Logging

Always use structured logging with objects:

```typescript
// ✅ Good - Structured
logger.info({
  msg: "User registered",
  userId: "123",
  email: "user@example.com",
  source: "web",
});

// ❌ Bad - String interpolation
logger.info(`User 123 registered with email user@example.com`);
```

## Sensitive Data Redaction

The logger automatically redacts sensitive fields:

- password
- token
- authorization
- cookie
- secret
- apiKey
- accessToken
- refreshToken

```typescript
// This will be automatically redacted
logger.info({
  msg: "User login",
  email: "user@example.com",
  password: "secret123", // Will be shown as [REDACTED]
});
```

## Environment Configuration

Configure logging via environment variables:

```bash
# Set log level (trace, debug, info, warn, error, fatal)
LOG_LEVEL=debug

# Enable logs in test mode
ENABLE_LOGS=true

# Set log directory (for production)
LOG_DIR=./logs
```

## Development vs Production

### Development

- Uses `pino-pretty` for human-readable, colorized output
- Default level: `debug`
- Logs to console

### Production

- Outputs JSON format
- Default level: `info`
- Can be configured for log rotation
- Includes deployment metadata (Vercel, Git SHA)

## Log Rotation (Production)

For production deployments, configure log rotation in [lib/logger-config.ts](../lib/logger-config.ts):

```typescript
export const logRotationConfig = {
  frequency: "daily", // daily, hourly, etc.
  maxSize: "10m", // Max file size before rotation
  maxFiles: 30, // Number of files to retain
  logDirectory: "./logs", // Log directory
  compress: true, // Compress old logs
};
```

### Using PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "app",
      script: "./server.js",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      max_size: "10M",
      retain: 10,
    },
  ],
};
```

### Using Docker

Docker and container orchestration systems (Kubernetes, Docker Compose) handle log rotation automatically. Just log to stdout/stderr.

## Request Logging Middleware

Use the `withLogging` wrapper to automatically log requests and responses:

```typescript
import { withLogging } from "@/lib/logger-middleware";

export const GET = withLogging(
  async (request: Request) => {
    // Your handler logic
  },
  {
    context: "api",
    logBody: true, // Log request body (sanitized)
    logResponse: false, // Log response body
  },
);
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Debug - detailed operational information
logger.debug({ msg: "Cache hit", key: "user:123" });

// Info - normal operations
logger.info({ msg: "User created", userId });

// Warn - unexpected but handled situations
logger.warn({ msg: "Rate limit approaching", remaining: 10 });

// Error - errors requiring attention
logger.error({ msg: "Database error", error: err.message, stack: err.stack });
```

### 2. Include Context

```typescript
// ✅ Good - Rich context
logger.info({
  msg: "Order processed",
  orderId,
  userId,
  amount,
  currency,
  paymentMethod,
});

// ❌ Bad - Missing context
logger.info({ msg: "Order processed" });
```

### 3. Log Errors Properly

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error({
    msg: "Operation failed",
    operation: "riskyOperation",
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    // Include relevant context
    userId,
    requestId,
  });
}
```

### 4. Use Child Loggers for Context

```typescript
// Create a child logger with persistent context
const userLogger = logger.child({ userId: "123" });

// All logs from this logger will include userId
userLogger.info({ msg: "Profile updated" });
userLogger.info({ msg: "Settings changed" });
```

### 5. Don't Log Sensitive Data

```typescript
// ✅ Good
logger.info({ msg: "User authenticated", userId, email });

// ❌ Bad
logger.info({ msg: "User authenticated", password, creditCard });
```

## Monitoring Integration

The logger can be integrated with monitoring services:

### Sentry

```typescript
import * as Sentry from "@sentry/nextjs";

// In logger-config.ts hooks
export function createLogHooks() {
  return {
    logMethod(inputArgs: any[], method: any, level: number) {
      if (level >= 50) {
        // error and fatal
        Sentry.captureException(inputArgs[0]);
      }
      return method.apply(this, inputArgs);
    },
  };
}
```

### Datadog

```typescript
// Send logs to Datadog using HTTP transport
// Configure in logger-config.ts or use Datadog agent
```

## Searching Logs

### In Development

Logs are human-readable in the console.

### In Production

Parse JSON logs with tools like:

```bash
# Filter by level
cat app.log | grep '"level":50'

# Filter by user
cat app.log | grep '"userId":"123"'

# Use jq for complex queries
cat app.log | jq 'select(.level >= 50)'
cat app.log | jq 'select(.userId == "123" and .context == "api")'
```

## Performance

Pino is extremely fast:

- ~30,000 ops/sec (JSON mode)
- Asynchronous logging doesn't block event loop
- Minimal overhead in production

## Migration from console.\*

The codebase has been migrated from `console.*` to Pino:

| Old               | New                                 |
| ----------------- | ----------------------------------- |
| `console.log()`   | `logger.info()` or `logger.debug()` |
| `console.error()` | `logger.error()`                    |
| `console.warn()`  | `logger.warn()`                     |
| `console.info()`  | `logger.info()`                     |

## Files Modified

Logging has been implemented in:

- ✅ [app/api/organizations/[id]/deadlines/[deadlineId]/documents/route.ts](../app/api/organizations/[id]/deadlines/[deadlineId]/documents/route.ts)
- ✅ [app/api/organizations/[id]/deadlines/[deadlineId]/route.ts](../app/api/organizations/[id]/deadlines/[deadlineId]/route.ts)
- ✅ [app/api/organizations/[id]/deadline-templates/[templateId]/route.ts](../app/api/organizations/[id]/deadline-templates/[templateId]/route.ts)
- ✅ [app/api/admin/global-templates/[id]/route.ts](../app/api/admin/global-templates/[id]/route.ts)
- ✅ [app/api/invites/[id]/route.ts](../app/api/invites/[id]/route.ts)

## Further Reading

- [Pino Documentation](https://getpino.io/)
- [Pino Best Practices](https://github.com/pinojs/pino/blob/master/docs/best-practices.md)
- [Pino Transports](https://github.com/pinojs/pino/blob/master/docs/transports.md)
