import * as vscode from 'vscode';

import type { PromptRequest } from './constants';

export async function callCursorAgent(request: PromptRequest): Promise<void> {
  await vscode.commands.executeCommand('composer.createNew', {
    autoSubmit: true,
    partialState: {
      text: request.prompt,
    },
  });
}
