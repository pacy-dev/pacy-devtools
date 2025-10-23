const { build, context } = require('esbuild');

const sharedConfig = {
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node16',
  sourcemap: false,
  minify: true,
};

const configs = [
  {
    ...sharedConfig,
    entryPoints: ['src/extension.ts'],
    outfile: 'out/extension.js',
    external: ['vscode'],
  },
];

async function buildAll(watch = false) {
  try {
    if (watch) {
      // For watch mode, create contexts and start watching
      const contexts = await Promise.all(
        configs.map(config => context(config))
      );
      
      await Promise.all(contexts.map(ctx => ctx.watch()));
      
      console.log('👀 Watching for changes...');
      
      // Keep the process alive
      process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping watch mode...');
        await Promise.all(contexts.map(ctx => ctx.dispose()));
        process.exit(0);
      });
      
      // Keep the process alive indefinitely
      await new Promise(() => {});
    } else {
      // For build mode, just build all configs
      await Promise.all(configs.map(config => build(config)));
      console.log('✅ Build completed successfully');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Check if watch mode is requested
const isWatch = process.argv.includes('--watch');
buildAll(isWatch); 