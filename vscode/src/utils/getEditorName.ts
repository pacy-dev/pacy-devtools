import * as vscode from 'vscode';

export type IDE = 'cursor' | 'windsurf' | 'vscode' | string;

export function getEditorName(): IDE {
  const appName = vscode.env.appName.toLowerCase();

  if (appName.includes('windsurf')) {
    return 'windsurf';
  } else if (appName.includes('cursor')) {
    return 'cursor';
  } else if (appName.includes('visual studio code')) {
    return 'vscode';
  }

  return appName;
}
