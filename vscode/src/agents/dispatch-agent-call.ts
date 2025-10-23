import { callCopilotAgent } from './call-copilot-agent';
import { callCursorAgent } from './call-cursor-agent';
import { callWindsurfAgent } from './call-windsurf-agent';

import type { PromptRequest } from './constants';

export async function dispatchAgentCall(
  request: PromptRequest & {
    method: 'cursor' | 'windsurf' | 'vscode' | 'cline' | 'roocode';
  },
) {
  switch (request.method) {
    case 'cursor':
      return await callCursorAgent(request);
    case 'windsurf':
      return await callWindsurfAgent(request);
    case 'vscode':
      console.log('Calling copilot agent with request:', request);
      return await callCopilotAgent(request);
    default:
    // vscode.window.showErrorMessage('Failed to call agent: IDE is not supported');
  }
}
