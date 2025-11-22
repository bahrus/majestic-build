import { readdir, writeFile } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively find all .mjs files excluding node_modules
 */
async function findMjsFiles(dir, fileList = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules
      if (entry.name !== 'node_modules') {
        await findMjsFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && extname(entry.name) === '.mjs') {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

/**
 * Process a single .mjs file
 */
async function processMjsFile(filePath) {
  try {
    // Convert file path to file:// URL for Windows compatibility
    const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`).href;
    
    // Dynamically import the module
    const module = await import(fileUrl);
    
    // Check if it has a render export
    if (typeof module.render !== 'function') {
      console.log(`⏭️  Skipping ${filePath} - no render() function`);
      return;
    }
    
    // Invoke the render function
    const result = await module.render();
    
    // Check if result is a string
    if (typeof result !== 'string') {
      console.log(`⚠️  Skipping ${filePath} - render() did not return a string`);
      return;
    }
    
    const firstChar = result.trim()[0];
    let outputPath;
    let outputType;
    
    // Determine output file based on first character
    if (firstChar === '<') {
      outputPath = filePath.replace(/\.mjs$/, '.html');
      outputType = 'HTML';
    } else if (firstChar === '[' || firstChar === '{') {
      outputPath = filePath.replace(/\.mjs$/, '.json');
      outputType = 'JSON';
    } else {
      console.log(`⏭️  Skipping ${filePath} - output doesn't start with <, [, or {`);
      return;
    }
    
    // Write the output file
    await writeFile(outputPath, result, 'utf8');
    console.log(`✅ Generated ${outputType}: ${outputPath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const startDir = process.cwd();
    console.log(`🔍 Searching for .mjs files in: ${startDir}\n`);
    
    const mjsFiles = await findMjsFiles(startDir);
    
    if (mjsFiles.length === 0) {
      console.log('No .mjs files found.');
      return;
    }
    
    console.log(`Found ${mjsFiles.length} .mjs file(s)\n`);
    
    // Process each file
    for (const file of mjsFiles) {
      await processMjsFile(file);
    }
    
    console.log('\n✨ Processing complete!');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();