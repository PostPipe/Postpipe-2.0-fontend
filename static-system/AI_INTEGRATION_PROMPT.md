# PostPipe Core System Integration Guide

**Role:** You are an expert Next.js Developer integrating the "PostPipe Core" system into an existing website.

**Objective:** Merge the files from this `static-system/postpipe-core` folder into your main Next.js application to enable PostPipe features (Connector Registration, Form Builder, Public Proxy, Dashboard).

---

## 📂 Source Structure

The `postpipe-core` folder contains the "Creator" components of the system:

- `app/` -> Routes, Pages, Server Actions (The Backend & UI).
- `lib/` -> Database Logic (`server-db.ts`).
- `config` -> `package.json`, `tailwind.config.ts`.

## 🛠️ Integration Steps

### 1. Dependencies

First, check `postpipe-core/package.json`. You need to install these key dependencies in your main project:

```bash
npm install mongodb crypto @postpipe/ui
```

_Note: If `@postpipe/ui` is internal, you may need to copy the UI components or replace them with your own design system._

### 2. Copy Files

Move the folders into your project structure.

- Copy `postpipe-core/lib/server-db.ts` to `your-project/lib/server-db.ts`.
- Copy `postpipe-core/app/*` to `your-project/app/*`.
  - `app/register`
  - `app/builder`
  - `app/dashboard`
  - `app/viewer`
  - `app/actions`
  - `app/api/public`

### 3. Environment Variables

You MUST configure the database in your main project's `.env` file:

```env
# PostPipe Core Database (Stores Connectors & Forms Metadata)
MONGODB_URI="mongodb+srv://..."
MONGODB_DB_NAME=postpipe_core
```

### 4. Database Setup

The system uses `server-db.ts` to talk to MongoDB.

- Ensure your MongoDB Atlas cluster allows connections.
- The collections `connectors` and `forms` will be created automatically.

### 5. Verify

Run your dev server (`npm run dev`) and visit:

1.  `/register` -> To register a local connector.
2.  `/builder` -> To build a form.
3.  `/dashboard` -> To view submissions.

---

## 🤖 AI Instructions

If you are an AI Agent performing this integration:

1.  **Read** `postpipe-core/lib/server-db.ts` to understand the data model.
2.  **Move** the files carefully, checking for path collisions.
3.  **Adjust Imports**: If you move `server-db.ts` to a different folder, update the imports in `app/actions/*.ts`.
4.  **Style**: The current files use Tailwind CSS. Ensure your project has Tailwind configured.
