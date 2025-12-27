# PostPipe Connector

This is a self-hosted connector for [PostPipe](https://postpipe.in).
It acts as a secure bridge between PostPipe's Ingest API and your private database.

## 🚨 Security Principles

1.  **Zero Trust**: This connector never trusts the payload blindly. It verifies the request signature `X-PostPipe-Signature` using your `POSTPIPE_CONNECTOR_SECRET`.
2.  **No Leaks**: Database credentials exist ONLY in this environment. PostPipe never sees them.
3.  **Audit**: All security logic is in `src/lib/security.ts`. You are encouraged to read it.

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Configuration

Copy `.env.example` to `.env` and fill in your details:

```env
POSTPIPE_CONNECTOR_ID=pp_conn_...
POSTPIPE_CONNECTOR_SECRET=...     # Keep this secret!
DB_TYPE=mongodb                   # mongodb | postgres | supabase
```

### 3. Run Locally

```bash
npm run dev
```

The server will listen on port 3000.
Endpoint: `POST http://localhost:3000/postpipe/ingest`

## 📦 Deployment

### Docker

```bash
docker build -t my-connector .
docker run -p 3000:3000 --env-file .env my-connector
```

### Vercel / Serverless

This project is set up as a standard Express app. To deploy to Vercel, simply add a `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "src/server.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.ts" }]
}
```

## 🛠 Troubleshooting

- **Invalid Signature**: Check that `POSTPIPE_CONNECTOR_SECRET` matches exactly what is in your PostPipe Dashboard.
- **Timestamp Skew**: Ensure your server's clock is synced (NTP). Requests older than 5 minutes are rejected.
