---
title: Static Connector Setup
description: Connect your existing database to the PostPipe platform using the Static Connector.
---

> [!NOTE]
> **Secure Data Proxy**  
> The PostPipe Static Connector establishes an encrypted tunnel between your infrastructure and the PostPipe platform, eliminating the need for firewall modifications or direct exposure.

## Request Lifecycle

```mermaid
graph LR
    A[Frontend Client] -- "1. POST Payload" --> B(PostPipe Platform)
    B -- "2. Signed Payload" --> C{Static Connector}
    C -- "3. Signature Verification" --> C
    C -- "4. Database Commit" --> D[(Target Database)]
    
    style B fill:#6366f1,color:#fff
    style C fill:#4f46e5,color:#fff
    style D fill:#10b981,color:#fff
```

## Prerequisites

Ensure the following requirements are met before deployment:

- **Node.js 18+** environment available on your hosting provider.
- An active account at [PostPipe.in](https://postpipe.in).

---

## Step 1: Deployment & Configuration

Navigate to the **[Static Connector Dashboard](https://www.postpipe.in/static)** and execute the following deployment sequence:

### Platform Deployment (Recommended)

1. **Initialize**: Provide a unique identifier for your connector instance (e.g., `production-db-connector`).
2. **Repository Fork**: Select the **Fork Template** action to copy the base connector repository to your GitHub account.
3. **Deploy**: Import the repository into your preferred hosting provider (e.g., Vercel, Railway, AWS AppRunner).
4. **Environment Variables**: Configure the generated credentials within your hosting provider's environment variables interface.
5. **Build Configuration**: Ensure the deployment pipeline executes `npm install` prior to the start command.

### Database Connection Strings

Depending on your target database, define the appropriate connection URI in your environment:

#### **MongoDB Environments**

- `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname`

#### **PostgreSQL Environments (Neon, Supabase, RDS)**

- `POSTGRES_URL=postgres://user:pass@host:5432/dbname`

---

## Advanced Configuration

### Multi-Database Routing

The connector supports routing to multiple database instances from a single deployment.

1. Within the **Form Builder**, define a **Target Database ID** (e.g., `marketing`).
2. Add an environment variable to the connector appending the uppercase ID: `MONGODB_URI_MARKETING`.
3. The connector will automatically route payloads targeting that ID to the specified database.

### Adapter Resolution

The connector automatically resolves the database adapter on a per-form basis. Naming conventions within the target database ID (e.g., `production-pg` or `neon-db`) will instruct the connector to utilize the PostgreSQL adapter, overriding the default `DB_TYPE` parameter.

### Environment Variable Prefixing

To mitigate variable name collisions in shared environments, define `POSTPIPE_VAR_PREFIX=CUSTOM`. The connector will subsequently look for `CUSTOM_POSTPIPE_CONNECTOR_ID`.

---

## Direct Data Fetching (SaaS Bypass)

The connector functions as an independent API, enabling direct data retrieval from your infrastructure without traversing the PostPipe platform.

**Endpoint**: `GET /api/postpipe/forms/:formId/submissions`  
**Query Parameters**:

- `limit`: Maximum record count (default: 50)
- `dbType`: Explicit adapter selection (`mongodb` or `postgres`)

**Example**:

```bash
curl https://connector.yourdomain.com/api/postpipe/forms/form_123/submissions?limit=10
```

---

## Step 2: Schema Mapping (Form Creation)

1. Access the [PostPipe Dashboard](https://postpipe.in).
2. Navigate to **[Forms](https://www.postpipe.in/dashboard/forms) → New Form**.
3. Define your schema parameters and save the configuration.

---

## Step 3: Verification

1. Extract the **HTML/React code snippet** generated for your form.
2. Integrate the snippet into your frontend application.
3. Execute a test submission and verify the data propagation in your target database.

> [!IMPORTANT]
> **Network Access Configuration**  
> Verify that your database's network access control list (ACL) or firewall permits incoming connections from your deployed connector's IP addresses.
