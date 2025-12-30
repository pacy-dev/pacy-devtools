import * as vscode from 'vscode';

export const getExtensions = () => {
  // Check for extension installations
  const extensions: ('Cline' | 'RooCode' | 'Copilot')[] = [];

  if (vscode.extensions.getExtension('saoudrizwan.claude-dev')) {
    extensions.push('Cline');
  }

  if (vscode.extensions.getExtension('rooveterinaryinc.roo-cline')) {
    extensions.push('RooCode');
  }

  if (
    vscode.extensions.getExtension('github.copilot-chat') ||
    vscode.extensions.getExtension('github.copilot')
  ) {
    extensions.push('Copilot');
  }

  return extensions;
};
