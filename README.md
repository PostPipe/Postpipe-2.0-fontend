# PostPipe 2.0 🧪

**Bridge the gap between your browser and your data, securely and efficiently.**

PostPipe 2.0 is a cutting-edge platform designed to enable secure data access without exposing your database credentials. Built on the principle of **Zero Trust**, it ensures that your sensitive keys never leave your infrastructure.

## 🌟 Core Philosophy

Traditional secure tunnels or cloud proxies often require some level of trust in the intermediary. PostPipe flips this on its head by utilizing a **Zero Trust Connector** model.

**Your database credentials should never leave your infrastructure.**

## 🛠️ How It Works

The PostPipe architecture consists of three main components:

1.  **PostPipe SaaS (The Lab)**: The central orchestration layer and dashboard. It manages forms and connectors but **never sees your database credentials**.
2.  **The Connector**: A self-hosted, lightweight Node.js secure agent that lives next to your database (on your laptop, server, or cloud VPC). It connects outbound to PostPipe SaaS using a secure ID and Secret.
3.  **The Browser**: The client-side interface that initiates requests.
    final

### The Zero Trust Flow

1.  **Request**: User initiates a request (e.g., submits a form) via the Browser to PostPipe SaaS.
2.  **Handoff**: PostPipe SaaS identifies the active connector.
3.  **Execution**: The **Connector** receives the instruction, executes the query locally using credentials stored **only** in its local `.env` file, and securely sends the result back.
4.  **Delivery**: PostPipe SaaS relays the result to the browser.

## 🚀 Key Features

- **🔒 Zero Trust Connectors**: Secure interactions without exposing DB credentials.
- **🌍 Universal Database Support**: Connect to MongoDB, PostgreSQL, DocumentDB, and more.
- **⚡ CLI Ecosystem**: A powerful suite of CLI tools (`create-postpipe-connector`, `create-postpipe-ecommerce`, etc.) to scaffold applications in seconds.
- **🧪 Dynamic Lab**: A sophisticated testing environment for your integrations.
- **📦 Monorepo Architecture**: specific, modular, and scalable codebase.

## 📖 Documentation

Expertly crafted documentation to get you up and running:

- **[Introduction](./documentation/introduction.md)**: Deep dive into the philosophy and architecture.
- **[Getting Started](./documentation/getting-started.md)**: Step-by-step guide to running your first simulation.
- **[Architecture](./documentation/architecture.md)**: Technical overview of the system.
- **[CLI Tools](./documentation/cli/index.md)**: Comprehensive guide to the PostPipe CLI ecosystem.

## ⚡ Local Development Setup

To run PostPipe locally, you need [Node.js](https://nodejs.org/) and [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory if you haven't already:
   ```env
   MONGODB_URI="mongodb://localhost:27017"
   MONGODB_DB_NAME="postpipe_core"
   JWT_SECRET="your-secret-key"
   ```

3. **Start the Local Database**:
   Make sure Docker Desktop is running, then spin up the local MongoDB instance:
   ```bash
   npm run db:start
   ```

4. **Seed the Database (Required for first login)**:
   Because the local database starts empty, run the seed scripts to populate an admin user and mock connector:
   ```bash
   # Creates an admin user (postpipe@admin.com / password123)
   npm run db:seed-user
   
   # Generates a mock connector in the dashboard
   npm run db:seed-connectors
   ```

5. **Start the Application**:
   ```bash
   npm run dev
   ```
   *The app will be available at [http://localhost:9002](http://localhost:9002).*

6. **Stopping the Database**:
   When you're done developing, you can stop the database container gracefully:
   ```bash
   npm run db:stop
   ```

See the full **[Getting Started Guide](./documentation/getting-started.md)** for details on architecture and advanced configurations.

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License**.

See the [LICENSE](./LICENSE) file for the full text.

---

_Built with ❤️ by the PostPipe Team_
