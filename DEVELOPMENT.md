
<div align="center">
  <img src="packages/assets/pacy-logo.svg" alt="Pacy Logo" width=200px>
</div>

# Pacy Devtools - Development Guide

This repository serves mostly as a hub for the GitHub issues and bug reports for Pacy Devtools, but it also involves the following packages:

- `mcp` is distributed as `@pacy-dev/mcp`.
- `plugin-devtools` is distributed as `@pacy-dev/plugin-devtools`.
- `vscode` is uploaded to Visual Studio Code Marketplace as "Pacy Devtools Bridge".

Currently, the rest of the Pacy Devtools is not open source. 

### `mcp`

This is an MCP server that communicates with Pacy DevTools. It informs the devtools about the status of the current task to show proper notifications, and detect when a task is complete. It's crucial for the chat panel to work.

### `plugin-devtools`

Currently mostly a wrapper of `code-inspector`, but we chose to use it by wrapping it, since we override some default settings. Also, in case of using it for more features in the future.

### `vscode`

This package is not included in the `pnpm-workspace.yaml`, because the `vsce package` command fails to run with the symlinked dependencies in the `node_modules`.

