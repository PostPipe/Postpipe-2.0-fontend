# VS Code MCP Configuration

This directory contains the workspace-specific configuration for [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers used by the VS Code MCP extension.

## Setup Instructions

If you have just cloned this repository, you will need to update the configuration file to make the custom MCP servers work on your local machine.

1. Open `.vscode/mcp.json`
2. Locate the `custom-chrome-devtools` server configuration.
3. Replace the placeholder `<ABSOLUTE_PATH_TO_YOUR_WORKSPACE>` with the actual absolute path to this project on your machine.

For example, your `mcp.json` should look like this:

```json
{
  "servers": {
    "custom-chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "tsx",
        "/Users/yourusername/path/to/project/devtools-mcp-server.ts"
      ]
    }
  }
}
```

Once updated, VS Code will be able to start the local MCP server properly!

### Automated Setup with Antigravity

If you are using Antigravity, you can simply ask your agent to do it for you! Just copy and paste the following prompt into your chat:

> "Update the `<ABSOLUTE_PATH_TO_YOUR_WORKSPACE>` placeholder in `.vscode/mcp.json` to the actual absolute path of this workspace."
