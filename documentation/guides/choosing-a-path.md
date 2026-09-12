---
title: Choosing Your Path
description: Determine the appropriate PostPipe integration model for your architecture.
---

# Choosing Your Integration Path

PostPipe provides two distinct integration models depending on your existing infrastructure and project lifecycle stage.

## Feature Comparison

| Capability | **Static (Connector)** | **Dynamic (CLI)** |
| :--- | :--- | :--- |
| **Target Use Case** | Existing applications, static sites | New applications, Next.js projects |
| **Setup Duration** | ~5-10 minutes | ~2 minutes (Scaffold generation) |
| **Infrastructure Control**| High (Self-hosted bridge and database) | Full (Complete code ownership) |
| **Core Delivery** | Express-based proxy middleware | Pre-configured application modules |
| **Customization Method**| Editing the local Connector configuration | Direct source code modification |
| **Cost** | Free (Open-source connector) | Free (Open-source modules) |

---

## Model 1: Static Connector

The Static Connector is intended for teams that already operate a database and frontend but require secure data ingestion (e.g., form handling, event tracking) without deploying custom API endpoints or managing integrations like SMTP.

**Integration Workflow:**
1. Deploy the **PostPipe Connector** (a lightweight Node.js/Express service) to your infrastructure.
2. Provide your database connection URI via environment variables on the Connector.
3. Register the Connector's public URL within the PostPipe Dashboard.
4. Transmit data via standard HTTP requests or the PostPipe Fetch API.

[Review the Static Connector Documentation](/docs/guides/static-connector)

---

## Model 2: Dynamic CLI Components

The Dynamic CLI is designed for bootstrapping new Next.js projects with robust, pre-configured backend architecture, such as authentication flows, dashboard layouts, and database schemas.

**Integration Workflow:**
1. Execute `npx create-postpipe-app@latest` in your development environment.
2. Select the necessary architectural components during the prompt.
3. The CLI generates a fully configured Next.js repository.
4. Deploy the generated application to your hosting provider (e.g., Vercel, AWS).

[Review the CLI Components Documentation](/docs/guides/cli-components)

---

## Decision Matrix

- If your goal is to **bridge existing infrastructure** to PostPipe services, select the **Static Connector**.
- If your goal is to **bootstrap a new architecture** with standardized patterns, select the **Dynamic CLI**.

[Return to Introduction](/docs/introduction)
