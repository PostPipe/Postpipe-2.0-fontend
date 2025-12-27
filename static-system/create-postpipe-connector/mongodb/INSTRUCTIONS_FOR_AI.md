# PostPipe Connector Guide

Use this guide to create a standalone Connector to ingest data from existing databases safely.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-connector@latest [directory-name]
# Choose Database: MongoDB (or others)
# Choose Deployment: Node.js / Docker
```

---

## Phase 2: Setup

**Step 2.1**: Configuration.
Edit `.env` in the created directory. Add your `POSTPIPE_CONNECTOR_ID` and `SECRET` obtained from PostPipe Dashboard.

**Step 2.2**: Connect Database.
Add your internal database Read-Only credentials to `.env`.

---

## Phase 3: Run

```bash
npm install
npm run dev
# The connector will start polling/listening and securely push data to PostPipe.
```
