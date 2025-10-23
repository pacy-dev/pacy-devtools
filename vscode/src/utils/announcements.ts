import * as https from 'https';
import * as vscode from 'vscode';

interface AnnouncementResponse {
  announcement?: {
    message: string;
    severity: 'info' | 'warning' | 'error';
    actionText?: string;
    actionUrl?: string;
  };
}

export async function checkForAnnouncements(context: vscode.ExtensionContext): Promise<void> {
  try {
    const currentVersion = context.extension.packageJSON.version;
    const response = await getAnnouncementInfo(currentVersion);

    if (response.announcement) {
      const { actionText, actionUrl, message, severity } = response.announcement;

      let showMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;

      switch (severity) {
        case 'error':
          showMessage = vscode.window.showErrorMessage;
          break;
        case 'warning':
          showMessage = vscode.window.showWarningMessage;
          break;
        default:
          showMessage = vscode.window.showInformationMessage;
      }

      const actions = actionText ? [actionText] : [];
      const action = await showMessage(message, ...actions);

      if (action === actionText && actionUrl) {
        vscode.env.openExternal(vscode.Uri.parse(actionUrl));
      }
    }
  } catch (error) {
    console.error('Failed to check for announcements:', error);
  }
}

async function getAnnouncementInfo(version: string): Promise<AnnouncementResponse> {
  return new Promise((resolve, reject) => {
    const url = `https://pacy.dev/api/ide-extension?version=${encodeURIComponent(version)}`;

    https
      .get(url, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse announcement response: ${error}`));
          }
        });
      })
      .on('error', (error: any) => {
        reject(new Error(`Failed to fetch announcement info: ${error}`));
      });
  });
}
