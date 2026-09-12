---
title: CLI Components
description: Scaffold production-ready architectural systems.
---

# PostPipe CLI Ecosystem

The PostPipe CLI enables rapid generation of complex, production-ready modules directly into your Next.js application.

## Execution Pattern

Execute any module via `npx` to scaffold the selected infrastructure into your working directory.

```bash
npx [component-name]
```

## Available Modules

### Core Infrastructure

- **`create-postpipe-connector`**: Generates the standard Express-based database proxy server.

### Authentication

- **`create-postpipe-auth`**: Scaffolds a complete Authentication service, including session management, database schemas, and email integration.

### E-commerce Ecosystem

- **`create-postpipe-ecommerce`**: Scaffolds a full e-commerce backend (Carts, Products, Orders).
- **`create-postpipe-shop`**: Generates single-store frontend logic and state management.
- **`create-postpipe-delivery`**: Installs shipment tracking schemas and logic.
- **`create-postpipe-payment`**: Integrates payment gateway adapters.

### Specialized Features

- **`create-postpipe-appointment`**: Installs a calendar and booking system.
- **`create-postpipe-form`**: Generates dynamic form validation schemas and submission endpoints.
- **`create-postpipe-profile`**: Scaffolds user profile and settings management.
- **`create-postpipe-cms`**: Installs a lightweight Content Management interface.
- **`create-postpipe-notify`**: Sets up scalable notification architectures.
