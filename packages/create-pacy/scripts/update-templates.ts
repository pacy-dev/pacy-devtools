import { glob } from 'glob';
import * as fs from 'fs/promises';

async function main() {
  try {
    // Find all vite.config files in template directories
    const viteConfigFiles = await glob('template-*/vite.config.{js,ts}');
    
    // Find all package.json files in template directories
    const packageJsonFiles = await glob('template-*/package.json');

    // Update vite.config files
    for (const file of viteConfigFiles) {
      console.log(`Processing ${file}...`);
      let content = await fs.readFile(file, 'utf-8');
      
      // Replace plugins array initialization
      content = content.replace('plugins: [', 'plugins: [pacyDevtools({ bundler: \'vite\' }), ');
      
      // Add import statement at the top of the file
      const importStatement = `import pacyDevtools from '@pacy-dev/plugin-devtools'\n`;
      content = importStatement + content;
      
      await fs.writeFile(file, content, 'utf-8');
      console.log(`✓ Updated ${file}`);
    }

    // Update package.json files
    for (const file of packageJsonFiles) {
      console.log(`Processing ${file}...`);
      const content = await fs.readFile(file, 'utf-8');
      const pkg = JSON.parse(content);

      // Add the new dependency
      if (!pkg.dependencies) {
        pkg.dependencies = {};
      }
      pkg.dependencies['@pacy-dev/plugin-devtools'] = '^0.1.0';

      // Write back the formatted JSON
      await fs.writeFile(
        file,
        JSON.stringify(pkg, null, 2) + '\n',
        'utf-8'
      );
      console.log(`✓ Updated ${file}`);
    }

    console.log('All files have been updated successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
