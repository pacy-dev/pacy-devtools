import { codeInspectorPlugin } from 'code-inspector-plugin';
import { createBuildErrorsPlugin } from './build-errors.js';
import type { CodeInspectorPluginOptions } from 'code-inspector-plugin';

type PacyDevtoolsOptions = {
  bundler: CodeInspectorPluginOptions['bundler'];
  codeInspectorOptions?: Omit<Parameters<typeof codeInspectorPlugin>[0], 'bundler'>;
  experimental?: {
    buildErrors?: boolean;
  };
};

export function pacyDevtools(options: PacyDevtoolsOptions) {
  const plugins = [];

  // Always include the code inspector plugin
  plugins.push(
    codeInspectorPlugin({
      bundler: options.bundler,
      hideDomPathAttr: true,
      hotKeys: false,
      hideConsole: true,
      skipSnippets: ['htmlScript'],
      pathType: 'absolute',
      ...options.codeInspectorOptions,
    }),
  );

  // Only add build errors plugin if explicitly enabled via experimental flag
  if (options.experimental?.buildErrors === true) {
    plugins.push(createBuildErrorsPlugin());
  }

  // For Vite, return array of plugins
  if (options.bundler === 'vite') {
    return plugins;
  }

  // For other bundlers, return single plugin (code inspector only for now)
  return plugins[0];
}

export default pacyDevtools;
