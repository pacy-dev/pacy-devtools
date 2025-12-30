import { exec } from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as semver from 'semver';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);
const npmPackageName = '@pacy-dev/tools';

type PackageInfo = {
  version: string;
  dist: {
    tarball: string;
  };
};

export async function checkForUpdate(context: vscode.ExtensionContext): Promise<void> {
  await performUpdateCheck(context, {
    showErrorMessages: true,
    updateButtonText: 'Update Now',
    notificationMessage: (currentVersion: string, latestVersion: string) =>
      `Update available: ${currentVersion} → ${latestVersion}`,
    successMessage: 'Extension is up to date',
  });
}

export async function checkForUpdateSilent(context: vscode.ExtensionContext): Promise<void> {
  const extensionName = context.extension.packageJSON.name;
  const config = vscode.workspace.getConfiguration(extensionName);
  const autoCheck = config.get<boolean>('autoCheckForUpdates', true);

  if (!autoCheck) {
    return;
  }

  await performUpdateCheck(context, {
    showErrorMessages: false,
    updateButtonText: 'Update',
    notificationMessage: (currentVersion: string, latestVersion: string) =>
      `Extension update available: ${currentVersion} → ${latestVersion}`,
  });
}

type UpdateCheckOptions = {
  showErrorMessages: boolean;
  updateButtonText: string;
  notificationMessage: (currentVersion: string, latestVersion: string) => string;
  successMessage?: string;
};

async function performUpdateCheck(
  context: vscode.ExtensionContext,
  options: UpdateCheckOptions,
): Promise<void> {
  try {
    const currentVersion = context.extension.packageJSON.version;
    const latestVersion = await getLatestVersionFromNpm(npmPackageName);

    if (!latestVersion) {
      console.error('No latest version found in npm');

      return;
    }

    if (isNewerVersion(latestVersion, currentVersion)) {
      const action = await vscode.window.showInformationMessage(
        options.notificationMessage(currentVersion, latestVersion),
        options.updateButtonText,
        'Later',
      );

      if (action === options.updateButtonText) {
        await updateExtension(context);
      }
    } else if (options.successMessage) {
      vscode.window.showInformationMessage(options.successMessage);
    }
  } catch (error) {
    if (options.showErrorMessages) {
      vscode.window.showErrorMessage(`Update check failed: ${error}`);
    } else {
      console.error('Silent update check failed:', error);
    }
  }
}

export async function updateExtension(context: vscode.ExtensionContext): Promise<void> {
  try {
    vscode.window.showInformationMessage('Starting extension update...');

    // Create temporary directory
    const tempDir = path.join(context.globalStorageUri.fsPath, 'temp-update');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download and extract npm package
    const packageInfo = await getPackageInfo(npmPackageName);
    const tarballPath = path.join(tempDir, 'package.tgz');

    console.log(tarballPath);

    await downloadFile(packageInfo.dist.tarball, tarballPath);

    // Extract tarball
    await execAsync(`tar -xzf "${tarballPath}" -C "${tempDir}"`);

    // Find VSIX file in the extracted package
    const packageDir = path.join(tempDir, 'package');
    const vsixFiles = fs.readdirSync(packageDir).filter((file) => file.endsWith('.vsix'));

    if (vsixFiles.length === 0) {
      throw new Error('No VSIX file found in the npm package');
    }

    const vsixPath = path.join(packageDir, vsixFiles[0]);

    // Install the VSIX file
    vscode.window.showInformationMessage('Installing update...');

    // Use VSCode's built-in command to install VSIX
    await vscode.commands.executeCommand(
      'workbench.extensions.installExtension',
      vscode.Uri.file(vsixPath),
    );

    // Clean up temp files
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Prompt to reload
    const reload = await vscode.window.showInformationMessage(
      'Extension updated successfully! Reload window to complete the update.',
      'Reload Now',
    );

    if (reload === 'Reload Now') {
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Update failed: ${error}`);
  }
}

async function getLatestVersionFromNpm(packageName: string): Promise<string> {
  const packageInfo = await getPackageInfo(packageName);
  return packageInfo.version;
}

async function getPackageInfo(packageName: string): Promise<PackageInfo> {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}/latest`;

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const packageInfo = JSON.parse(data);
            resolve(packageInfo);
          } catch (error) {
            reject(new Error(`Failed to parse package info: ${error}`));
          }
        });
      })
      .on('error', (error) => {
        reject(new Error(`Failed to fetch package info: ${error}`));
      });
  });
}

async function downloadFile(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });

        file.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(error);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function isNewerVersion(newVersion: string, currentVersion: string): boolean {
  return semver.gt(newVersion, currentVersion);
}
