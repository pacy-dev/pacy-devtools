import * as vscode from 'vscode';

import type { PromptRequest } from './constants';

export async function callCopilotAgent(request: PromptRequest): Promise<void> {
  const prompt =
    `${request.prompt}` +
    `${request.files ? `\n\n use the following files: ${request.files.join('\n')}` : ''}` +
    `${request.images ? `\n\n use the following images: ${request.images.join('\n')}` : ''}`;

  await vscode.commands.executeCommand('workbench.action.chat.sendToNewChat', {
    inputValue: prompt.replace(
      '/pacy',
      'Please use the pacy-devtools.task_update tool if available with this id: ',
    ),
  });
}
