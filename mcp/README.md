# Pacy Devtools MCP

This is an MCP server that communicates with Pacy DevTools. It informs the devtools about the status of the current task to show proper notifications, and detect when a task is complete. It's crucial for the chat panel to work.

For more information, visit https://pacy.dev.

You can install it to multiple clients at once using:

```bash
# Install Pacy Devtools CLI globally
npm install -g pacy-devtools 
# Install the MCP
pacy install-mcp
```

For manual installation, you can add the following to the MCP config directory of your client:

```json
{
  "mcpServers": {
    "pacy-devtools": {
      "command": "npx",
      "args": ["-y", "@pacy-dev/mcp@latest"]
    }
  }
}
```