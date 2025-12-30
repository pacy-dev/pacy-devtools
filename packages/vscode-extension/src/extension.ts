// import { isPortAvailable } from '@pacy/cli/src/server/utils/isPortAvailable';
import * as vscode from 'vscode';

import { ClineMessageHandler } from './agents/ClineMessageHandler';
import { dispatchAgentCall } from './agents/dispatch-agent-call';
// import { checkForAnnouncements } from './utils/announcements';
// import { checkForUpdate, updateExtension, checkForUpdateSilent } from './next/updates';
import { generateId } from './utils/generateId';
import { getEditorName } from './utils/getEditorName';
import { getExtensions } from './utils/getExtensions';
import { VSCodeClient } from './utils/VSCodeClient';
import { readConfig } from '../../../cli/src/server/globalConfig';

interface ExtensionState {
  title?: string;
  folders: string[];
  editor: 'vscode' | 'cursor' | 'windsurf' | string;
  extensions: ('Cline' | 'RooCode' | 'Copilot')[];
}

let client: VSCodeClient | null = null;

// const startServer = () => {
//   // This is currently not used. Maybe will be removed forever.
//   // if (process.env.NODE_ENV === 'production') {
//   //   execSync(`npx -y pacy-devtools server start`);
//   // }
// };

export async function activate(context: vscode.ExtensionContext) {
  const extensionName = context.extension.packageJSON.name;
  console.log(`${extensionName} is now active.`);

  // Check if the port is available, and if not, start the server
  const { port } = readConfig().server;
  // const portAvailable = await isPortAvailable(port);

  // if (portAvailable) {
  //   startServer();
  // }

  // Gather info to register the open window to the server
  const editor = getEditorName();
  const extensions = getExtensions();
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  let folders = workspaceFolders.map((folder) => folder.uri.fsPath);

  const initialState: ExtensionState = {
    title: vscode.workspace.name,
    folders,
    editor,
    extensions,
  };

  const clineHandler = new ClineMessageHandler();
  const rooCodeHandler = new ClineMessageHandler({ isRoocode: true });

  // Create and connect the WebSocket client
  client = new VSCodeClient({
    id: generateId(),
    initialState,
    port,

    onMessage: (message) => {
      // console.log('Received message from bridge:', message);

      if (!message.type) {
        return;
      }

      if (message.type.includes('cline')) {
        // TODO: migrate these to an "agent_call" message as well.
        clineHandler.handleMessage(message, client!.sendMessage.bind(client));
      } else if (message.type.includes('roocode')) {
        // TODO: migrate these to an "agent_call" message as well.
        rooCodeHandler.handleMessage(message, client!.sendMessage.bind(client));
      } else if (message.type === 'agent_call') {
        // We're eventually going to migrate others into an "agent_call" message as well.
        dispatchAgentCall(message);
      }
    },
  });

  // Connect to the bridge server
  try {
    await client.connect();
    console.log('Successfully connected to Pacy DevTools Bridge');
  } catch (error) {
    console.error('Failed to connect to Pacy DevTools Bridge:', error);
  }

  // Update folders when workspace folders change
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      const updatedFolders = vscode.workspace.workspaceFolders || [];
      folders = updatedFolders.map((folder) => folder.uri.fsPath);

      // Update client state with new folders
      if (client) {
        client.updateState({
          folders,
          title: vscode.workspace.name,
        });
      }
    }),
  );

  // DO NOT REMOVE THE FOLLOWING, COMMENTED OUT CODE.
  // We might use this in the future, if we would like to host the extension on our own.

  // Register command to check for updates
  // const checkUpdateCommand = vscode.commands.registerCommand(
  //   `${extensionName}.checkForUpdate`,
  //   async () => {
  //     await checkForUpdate(context);
  //   },
  // );

  // Register command to force update
  // const updateCommand = vscode.commands.registerCommand(
  //   `${extensionName}.updateExtension`,
  //   async () => {
  //     await updateExtension(context);
  //   },
  // );

  // context.subscriptions.push(checkUpdateCommand, updateCommand);

  // Check for updates on startup
  // checkForUpdateSilent(context);

  // Check for announcements on startup
  // checkForAnnouncements(context);

  // Clean up on deactivation
  context.subscriptions.push({
    dispose: () => {
      if (client) {
        client.disconnect();
        client = null;
      }
    },
  });
}

export function deactivate() {
  if (client) {
    client.disconnect();
    client = null;
  }
}
