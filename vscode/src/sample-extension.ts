import * as vscode from 'vscode';

import { checkForAnnouncements } from './utils/announcements';
import { checkForUpdate, updateExtension, checkForUpdateSilent } from './utils/updates';

export function activate(context: vscode.ExtensionContext) {
  const extensionName = context.extension.packageJSON.name;

  console.log(`${extensionName} is now active.`);

  // Register command to check for updates
  const checkUpdateCommand = vscode.commands.registerCommand(
    `${extensionName}.checkForUpdate`,
    async () => {
      await checkForUpdate(context);
    },
  );

  // Register command to force update
  const updateCommand = vscode.commands.registerCommand(
    `${extensionName}.updateExtension`,
    async () => {
      await updateExtension(context);
    },
  );

  context.subscriptions.push(checkUpdateCommand, updateCommand);

  // Check for updates on startup
  checkForUpdateSilent(context);

  // Check for announcements on startup
  checkForAnnouncements(context);
}

export function deactivate() {}
