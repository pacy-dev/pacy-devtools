import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const homeDir = os.homedir();
const platform = process.platform as 'win32' | 'darwin' | 'linux';

export const globalConfigPath = path.join(
  platform === 'win32'
    ? process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming')
    : platform === 'darwin'
      ? path.join(homeDir, 'Library', 'Application Support')
      : process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config'),
  'pacy-devtools',
  'config.json',
);

export function readPortConfig(): number {
  if (fs.existsSync(globalConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));
      return config.port || 3434; // Default to 3434 if no port is configured
    } catch {
      // If reading or parsing fails, return default
      return 3434;
    }
  }

  return 3434; // Default port if config file doesn't exist
}
