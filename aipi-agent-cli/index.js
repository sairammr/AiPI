#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ASCII Art Banner
const banner = `
╔════════════════════════════════════════════════╗
║                                                ║
║    █████   ██ ██ ██  ██████   ██ ██ ██         ║
║   ██   ██     ██     ██   ██     ██            ║
║   ███████     ██     ██████      ██            ║
║   ██   ██     ██     ██          ██            ║
║   ██   ██  ██ ██ ██  ██       ██ ██ ██         ║
║                                                ║
║         agent kit x402 starter template        ║
║                                                ║
╚════════════════════════════════════════════════╝
`;

console.log(chalk.cyan(banner));

program
  .name('aipi-agent')
  .description('A I P I - agent kit x402 starter template')
  .argument('[project-name]', 'Name of the project directory')
  .action(async (projectName) => {
    const targetDir = projectName || 'aipi-agent';
    
    console.log(chalk.yellow(`\n🚀 Creating new AiPI agent project: ${chalk.bold(targetDir)}\n`));
    
    // Check if directory already exists
    if (fs.existsSync(targetDir)) {
      console.log(chalk.red(`❌ Error: Directory '${targetDir}' already exists. Please choose a different name.`));
      process.exit(1);
    }
    
    const spinner = ora('Cloning onchain-agent directory...').start();
    
    try {
      // Create temporary directory for sparse checkout
      const tempDir = `${targetDir}-temp`;
      const git = simpleGit();
      
      // Clone with sparse checkout
      await git.clone('https://github.com/sairammr/AiPI.git', tempDir, ['--no-checkout']);
      
      // Configure sparse checkout
      process.chdir(tempDir);
      execSync('git sparse-checkout init --cone', { stdio: 'inherit' });
      execSync('git sparse-checkout set onchain-agent', { stdio: 'inherit' });
      execSync('git checkout', { stdio: 'inherit' });
      
      // Move the onchain-agent directory to target location
      process.chdir('..');
      fs.renameSync(path.join(tempDir, 'onchain-agent'), targetDir);
      
      // Clean up temporary directory
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      spinner.text = 'Installing dependencies...';
      
      // Install dependencies
      process.chdir(targetDir);
      execSync('npm install', { stdio: 'inherit' });
      
      spinner.succeed('Project created successfully!');
      
      console.log(chalk.green('\n✅ AiPI agent project is ready!'));
      console.log(chalk.cyan('\n📁 Next steps:'));
      console.log(chalk.white(`   cd ${targetDir}`));
      console.log(chalk.white('   cp .example.env .env.local'));
      console.log(chalk.white('   # Edit .env.local with your API keys'));
      console.log(chalk.white('   npm run dev'));
      
      console.log(chalk.yellow('\n🔗 Documentation: https://github.com/sairammr/AiPI'));
      
    } catch (error) {
      spinner.fail('Failed to create project');
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(); 