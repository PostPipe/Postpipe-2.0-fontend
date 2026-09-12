---
title: Introduction
description: PostPipe provides both Dynamic and Static integration paths for your backend architecture.
---

## Quick Start

Before beginning, follow these steps to set up your PostPipe environment:

1. **Create an Account**: Register at [PostPipe.in](https://postpipe.in).
2. **Choose Your Path**: Determine whether your project requires the **Static (Connector)** or **Dynamic (CLI)** integration. See the [Choosing Your Path Guide](/docs/guides/choosing-a-path) for a detailed comparison.
3. **Connect Your Database**: Follow the setup instructions specific to your chosen path.
4. **Create a Form**: Use the PostPipe Dashboard to map your frontend inputs to your database schema.

---

## Integration Paths

### 1. Static (Connector)

Designed for connecting an existing database (MongoDB or PostgreSQL) to the PostPipe platform.

- **Objective**: Securely transmit data payloads to your configured database.
- **Architecture**: Utilizes the PostPipe Connector, an Express-based bridge.
- **Features**: Automatic adapter resolution and multi-database routing.
- **Reference**: [Static Connector Setup](/docs/guides/static-connector)

### 2. Dynamic (CLI)

Designed for scaffolding new Next.js backends using pre-built modules and the PostPipe CLI.

- **Objective**: Rapidly deploy authentication, e-commerce, or store management systems.
- **Architecture**: Utilizes the PostPipe CLI Ecosystem for component generation.
- **Reference**: [CLI Components Guide](/docs/guides/cli-components)

---

## Reference Material

- **[How It Works](/docs/how-it-works)**: Detailed overview of the hybrid architecture.
- **[System Architecture](/docs/architecture)**: Monorepo structure and data flow.
- **[Auth Presets & Aliases](/docs/guides/auth-presets-and-aliases)**: Authentication implementation and environment configuration.
- **[Security](/docs/security)**: Signature verification and Zero-Trust principles.
