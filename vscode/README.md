# Pacy Devtools Bridge

This is the VSCode extension for Pacy Devtools. It supports major VSCode forks, and it's mainly used for sending prompts to AI agents. Currently, it supports sending messages to Copilot, Cascade, Cline, and RooCode. For sending prompts to Claude Code and Codex, this extension is not necessary.

You can refer to https://pacy.dev/docs for usage instructions.

## What it does

- It checks the Pacy Devtools config the following folders:
  - On Windows: `C:\Users\<USERNAME>\AppData\Roaming\pacy-devtools\config.json`
  - On MacOS: `/Users/<USERNAME>/Library/Application Support/pacy-devtools/config.json`
  - On Linux: `/home/<USERNAME>/.config/pacy-devtools/config.json`
- If no config is set, uses `3434` as the websocket server port.
- It tries to connect to the websocket server to register its own VSCode instance, and listens for prompts.
