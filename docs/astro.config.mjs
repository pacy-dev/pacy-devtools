// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from 'starlight-theme-rapide'
import { ExpressiveCodeTheme } from 'astro-expressive-code';
import { theme as customTheme } from './integrations/custom-theme.js';
import { codeInspectorPlugin } from 'code-inspector-plugin';

// https://astro.build/config
export default defineConfig({
	base: '/docs/',
	server: {
		port: 2222,
	},
	vite: {
		plugins: [
			codeInspectorPlugin({
				bundler: 'vite',
				hideDomPathAttr: true,
				hotKeys: false,
				hideConsole: true,
				pathType: 'absolute'
			})
		],
	},
	integrations: [
		starlight({
			plugins: [starlightThemeRapide()],
			title: 'Pacy Devtools',
			defaultLocale: 'root',
			logo: {
				src: './src/assets/pacy-logo.svg',
				replacesTitle: true,
			},
			customCss: [
				// Path to your custom CSS file
				'./src/styles/custom.css',
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/pacy-dev/pacy-devtools' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Overview', link: '/overview' },
						{ label: 'Usage', link: '/usage' },
						{ label: 'Framework Configuration', link: '/framework-configuration' },
						{ label: 'Sending prompts', link: '/sending-prompts' },
						{ label: 'Experimental features', link: '/experimental-features' },
						{ label: 'Troubleshooting', link: '/troubleshooting' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Settings', link: '/settings' },
						{ label: 'CLI', link: '/cli-reference' },
						{ label: 'Changelog', link: '/changelog' },
					],
				},
			],
			// Use custom theme for syntax highlighting
			expressiveCode: {
				themes: [new ExpressiveCodeTheme(customTheme), 'github-light'],
			},
		}),
	],
});
