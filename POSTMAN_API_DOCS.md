# Postpipe Form API Documentation (Postman Guide)

This guide documents the API endpoints and Server Actions involved in taking a new user from database configuration to form creation, deployment, and data submission. 

## API Overview Table

| Step | API / Action | Method | Endpoint / Header | Usage & Working |
| :--- | :--- | :--- | :--- | :--- |
| **1. Ensure Connector Exists** | `getConnectorsAction` (Server Action) | POST | `/` + `Next-Action` header | Fetches the user's provisioned connectors to ensure readiness before creating a form. A connector acts as the middleman for database interactions. |
| **2. Ensure DB Config Exists** | `POST /api/database/config` | POST | `/api/database/config` | Saves the database connection URI where form submissions will be stored for the user (e.g., MongoDB URI). |
| **3. Create Form & Add Fields** | `createFormAction` (Server Action) | POST | `/` + `Next-Action` header | Accepts multipart form-data including form name, connectorId, and the JSON schema array of `fields` (e.g., email, message). Deploys the form and prepares the runtime. |
| **4. Deploy / Fetch Public URL** | *Handled implicitly in Step 3* | N/A | N/A | Once created, the form is instantly "Live". A public submit URL is formulated using the generated `formId`. |
| **5. Submit Data to Form** | `POST /api/public/submit/[formId]` | POST | `/api/public/submit/[formId]` | The active payload receiver endpoint. Accepts JSON/FormData. Validates status, packages the payload with routing rules, signs it, and forwards it to the Connector's webhook for final ingestion. |

**Note on Next.js Server Actions:** Postpipe's form builder uses Next.js Server Actions instead of traditional REST APIs for form management. Calling Server Actions from Postman requires specific HTTP headers (`Next-Action`), but we have mapped out the workflow below.

---

## 1. Ensure Database Config Exists
Before creating a form, ensure the user has a target database configured.

- **Endpoint:** `POST /api/database/config`
- **Description:** Saves the target database connection string for the user.
- **Headers:**
  - `Content-Type: application/json`
  - *(Cookie must contain valid session)*
- **Body:**
```json
{
  "databases": {
    "default": {
      "uri": "mongodb+srv://<user>:<pass>@cluster.mongodb.net/",
      "dbName": "postpipe_data",
      "type": "mongodb"
    }
  },
  "defaultTarget": "default"
}
```

## 2. Create and Deploy Form
Form creation, adding fields, and deployment are bundled into a single Server Action.

- **Action Endpoint:** `POST /` (or the specific dashboard path like `/dashboard/builder`)
- **Headers:** 
  - `Next-Action: <ACTION_ID>` *(Found in your Next.js build manifest)*
  - `Content-Type: multipart/form-data`
  - *(Cookie must contain valid session)*
- **Form-Data Body Fields:**
  - `name`: `My Contact Form`
  - `connectorId`: `<Your-Connector-ID>`
  - `targetDatabase`: `default`
  - `fields`: `[{"name":"email","type":"string","required":true},{"name":"message","type":"text","required":true}]`
- **Postman Note:** Since Next-Action IDs change per build, it is usually recommended to perform form creation via the browser UI. However, if building an automation, you must extract the Next-Action ID from the frontend client js.

## 3. Submit Data to Form (Public API)
Once the form is deployed, it exposes a public HTTP endpoint suitable for any client, including standard POST requests from other apps or direct browser submissions.

- **Endpoint:** `POST /api/public/submit/[formId]`
- **Description:** Submits form entry data to the configured connector & database.
- **Headers:**
  - `Content-Type: application/json` (or `multipart/form-data`)
  - `Origin: <Your-Origin>` (Optional, supports CORS)
- **Body:**
```json
{
  "email": "user@example.com",
  "message": "Hello from Postman!"
}
```
- **Response:**
```json
{
  "success": true,
  "submissionId": "sub_xyz123abc"
}
```

## Piko AI Agentic API (New)
For agentic AI like Piko to manage forms autonomously, use the specialized V1 Piko API. This uses an API Key for authentication instead of a session cookie.

### 1. Create and Deploy Form (Piko)
- **Endpoint:** `POST /api/piko/v1/forms`
- **Description:** Direct API for AI agents to create/deploy forms.
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`
  - `Content-Type: application/json`
- **Body Structure:**
```json
{
  "name": "AI Generated Form",
  "connectorId": "conn_xyz123",
  "targetDatabase": "default",
  "fields": [
    { "name": "email", "type": "email", "required": true },
    { "name": "message", "type": "textarea", "required": false }
  ],
  "routing": {
    "broadcast": ["backup_db"],
    "splits": []
  }
}
```

### 2. Fetch Connectors and Secrets (Piko)
- **Endpoint:** `GET /api/piko/v1/connectorsAndSecrets`
- **Description:** Retrieve all configured connectors and their secure secrets (`sk_live_...`).
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`

### 3. Fetch Configured Databases (Piko)
- **Endpoint:** `GET /api/piko/v1/databases`
- **Description:** Retrieve the user's configured target databases (e.g., MongoDB, Postgres targets).
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`
- **Query Params:**
  - `connectorId`: *(Optional)* Find database config via a specific connector ID.
- **Response:**
```json
{
  "success": true,
  "databases": {
    "default": { "uri": "...", "dbName": "..." },
    "backup": { "uri": "...", "dbName": "..." }
  },
  "defaultTarget": "default",
  "rules": []
}
```

### 4. Verify Login & Get User Info (Piko)
- **Endpoint:** `GET /api/piko/v1/loginVerify`
- **Description:** Verify the API key is valid and retrieve the associated user's account details.
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`
- **Response:**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "64a2b...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "image": "https://..."
  }
}
```

### 5. Create Auth Preset (Piko)
- **Endpoint:** `POST /api/piko/v1/auth-presets`
- **Description:** Create a new authentication configuration preset.
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`
- **Body:**
```json
{
  "name": "Production Auth",
  "connectorId": "conn_123",
  "providers": {
    "email": true,
    "google": true,
    "github": false
  },
  "redirectUrl": "https://myapp.com/callback"
}
```

### 6. List Auth Presets (Piko)
- **Endpoint:** `GET /api/piko/v1/auth-presets`
- **Description:** Retrieve all configured authentication presets.
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`

### 7. Manage Single Auth Preset (Piko)
- **Endpoints:** 
  - `GET /api/piko/v1/auth-presets/[id]`
  - `PATCH /api/piko/v1/auth-presets/[id]`
  - `DELETE /api/piko/v1/auth-presets/[id]`
- **Headers:** 
  - `x-piko-api-key`: `<Your-Piko-API-Key>`

## Summary of the Workflow
1. User logs in (receives session Cookie).
2. Sets up their database configuration via `/api/database/config`.
3. Submits a Multipart form payload to the Builder Action to generate a form.
4. Distributes the resulting `/api/public/submit/[formId]` URL.
5. Clients send data to that public URL.
6. **(Agentic)** Piko AI uses the `x-piko-api-key` to:
   - Call `/api/piko/v1/loginVerify` to confirm authentication and owner details.
   - Call `/api/piko/v1/databases` to get target storage options.
   - Call `/api/piko/v1/connectorsAndSecrets` to find where to deploy.
   - Call `/api/piko/v1/auth-presets` to manage authentication settings.
   - Call `/api/piko/v1/forms` to automate deployment.
