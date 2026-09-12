---
title: Architecture
description: Overview of the PostPipe Monorepo and Zero-Trust Data Flow.
---

# System Architecture

PostPipe utilizes a modern Monorepo architecture managed by TurboRepo. This structure allows us to maintain the core SaaS platform, CLI tooling, and shared UI libraries within a single, cohesive repository.

## Directory Structure

The high-level organization of the repository is as follows:

```text
PostPipe-2.0/
├── apps/               # Next.js Applications
│   ├── web/            # Core SaaS Platform (Dashboard)
│   ├── dynamic/        # Internal Dynamic Components
│   └── static/         # Internal Static Components
├── cli/                # CLI Ecosystem
│   ├── create-postpipe-connector/ # Connector scaffolding engine
│   └── components-cli/            # Dynamic component templates
├── packages/           # Shared Internal Libraries
│   └── ui/             # Reusable UI component registry
├── documentation/      # Documentation markdown files
└── templates/          # Base templates for supported frameworks
```

## Core Infrastructure Components

### 1. The SaaS Platform (`apps/web`)

The central control plane for PostPipe services. Built on Next.js, this application manages:

- Authentication and session handling.
- Connector orchestration (registration, health checks).
- Form schema management.
- Data ingestion and request relaying.

### 2. The CLI Ecosystem (`cli/`)

Tooling for local scaffolding and backend generation.

- **Execution**: Run via `npx` (e.g., `npx create-postpipe-app`).
- **Templating**: Logic for generating authentication systems, database connections, and specialized components resides in `cli/components-cli`. This modular design enables updates to templates without requiring global binary updates.

### 3. Shared Packages (`packages/`)

To guarantee design consistency across the core platform and generated components, UI elements (buttons, inputs, layouts) are maintained centrally within the `packages/ui` workspace.

## Data Flow: Zero-Trust Model

The architecture enforces a strict Zero-Trust flow for data operations between the PostPipe control plane and user-deployed Connectors.

1. **Ingress**: A client payload hits the `apps/web` endpoints.
2. **Routing**: The platform identifies the target `ConnectorID` and prepares the payload.
3. **Tunneling**: The platform forwards the encrypted payload to the active Connector instance.
4. **Verification**: The local Connector computes and verifies the `X-PostPipe-Signature`.
5. **Execution**: The Connector resolves the target database schema (Smart Resolution) and executes the requested operation.
6. **Egress**: The result is transmitted back to `apps/web` and returned to the client.
