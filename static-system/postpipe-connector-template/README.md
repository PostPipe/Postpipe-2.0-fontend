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

## 🚀 Deployment

### 1-Click Deploy

Use the buttons below to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sourodip-1/postpipe-connector-template&project-name=postpipe-connector&repository-name=postpipe-connector&env=POSTPIPE_CONNECTOR_ID,POSTPIPE_CONNECTOR_SECRET)

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FSourodip-1%2Fpostpipe-connector-template%2Fmain%2Fazuredeploy.json)

### Manual Deployment

1. **Clone & Install**
   ```bash
   git clone https://github.com/Sourodip-1/postpipe-connector-template
   cd postpipe-connector-template
   npm install
   ```
2. **Configure Environment**
   Set `POSTPIPE_CONNECTOR_ID` and `POSTPIPE_CONNECTOR_SECRET` in your dashboard or `.env` file.

3. **Deploy**
   - **Docker**: `docker build -t connector . && docker run -p 3000:3000 connector`
   - **Vercel**: `vercel deploy`
   - **Azure**: Use the "Deploy to Azure" button or CLI.

## 🛠 Troubleshooting

- **Invalid Signature**: Check that `POSTPIPE_CONNECTOR_SECRET` matches exactly what is in your PostPipe Dashboard.
- **Timestamp Skew**: Ensure your server's clock is synced (NTP). Requests older than 5 minutes are rejected.
