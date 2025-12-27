#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

const program = new Command();
let projectPath: string = '';

program
  .name('create-postpipe-connector')
  .description('Scaffold a PostPipe 2.0 Connector')
  .arguments('[project-directory]')
  .action((name: string) => {
    projectPath = name;
  })
  .parse(process.argv);

async function run() {
  console.log(chalk.bold.blue('🚀 PostPipe 2.0 Connector Wizard'));
  console.log(chalk.gray('Zero-trust, credential-safe ingestion system.'));
  console.log();

  if (!projectPath) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'Where should we create the connector?',
      initial: 'my-connector'
    });
    projectPath = res.path;
  }

  if (!projectPath) process.exit(1);

  const root = path.resolve(projectPath);
  const appName = path.basename(root);

  // 1. Wizard
  const response = await prompts([
    {
      type: 'select',
      name: 'dbType',
      message: 'Which database will you use?',
      choices: [
        { title: 'MongoDB (Recommended)', value: 'mongodb' },
        { title: 'DocumentDB (PostPipe Compatible)', value: 'documentdb' },
        { title: 'PostgreSQL', value: 'postgres' },
        { title: 'Supabase', value: 'supabase' },
      ]
    },
    {
      type: 'select',
      name: 'deployment',
      message: 'How will you deploy this?',
      choices: [
        { title: 'Node.js Server (Typical)', value: 'node' },
        { title: 'Docker Container', value: 'docker' },
      ]
    }
  ]);

  if (!response.dbType || !response.deployment) process.exit(1);

  if (response.dbType === 'documentdb') {
      console.log(chalk.yellow('DocumentDB templates are coming soon!'));
      process.exit(0);
  }

  // 2. Scaffold
  console.log();
  console.log(`Creating connector in ${chalk.green(root)}...`);

  fs.ensureDirSync(root);
  
  // Select template based on DB
  let templateDir = '';
  if (response.dbType === 'mongodb') {
      templateDir = path.join(__dirname, 'mongodb', 'template');
  } else if (response.dbType === 'postgres') {
      templateDir = path.join(__dirname, 'postgres', 'template');
  } else if (response.dbType === 'supabase') {
      templateDir = path.join(__dirname, 'supabase', 'template');
  } else {
      // Fallback
      templateDir = path.join(__dirname, 'templates', 'default');
  }

  if (!fs.existsSync(templateDir)) {
      console.error(chalk.red(`Template not found at ${templateDir}`));
      process.exit(1);
  }

  fs.copySync(templateDir, root);

  // 3. Customize Package.json
  const pkgPath = path.join(root, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.name = appName;
  
  // Add dependencies based on DB
  const dependencies: Record<string, string> = {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  };
  const devDeps: Record<string, string> = {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.0",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  };

  if (response.dbType === 'mongodb') {
    dependencies['mongodb'] = '^5.7.0';
  } else if (response.dbType === 'postgres') {
    dependencies['pg'] = '^8.11.3';
    devDeps['@types/pg'] = '^8.10.2';
  } else if (response.dbType === 'supabase') {
    dependencies['@supabase/supabase-js'] = '^2.32.0';
  }

  pkg.dependencies = { ...pkg.dependencies, ...dependencies };
  pkg.devDependencies = { ...pkg.devDependencies, ...devDeps };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // 4. Create .env
  const envContent = `
PORT=3000

# Security (Get these from PostPipe Dashboard)
POSTPIPE_CONNECTOR_ID=
POSTPIPE_CONNECTOR_SECRET=

# Database Configuration
DB_TYPE=${response.dbType}

# Database Credentials
MONGODB_URI=mongodb://localhost:27017/postpipe
POSTGRES_URI=postgresql://user:pass@localhost:5432/db
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
`;
  fs.writeFileSync(path.join(root, '.env'), envContent);
  fs.writeFileSync(path.join(root, '.env.example'), envContent);

  // 5. Success
  console.log();
  console.log(chalk.green('Success! Created connector.'));
  console.log();
  console.log('Next steps:');
  console.log(chalk.cyan(`  cd ${projectPath}`));
  console.log(chalk.cyan('  npm install'));
  console.log(chalk.cyan('  # Fill in .env with your secrets'));
  console.log(chalk.cyan('  npm run dev'));
  console.log();
  console.log(chalk.yellow.bold('IMPORTANT SECURITY NOTICE:'));
  console.log(chalk.yellow('  This connector is the GATEKEEPER to your database.'));
  console.log(chalk.yellow('  Ensure POSTPIPE_CONNECTOR_SECRET is strong and rotated if leaked.'));
  console.log();
}

run().catch((reason) => {
  console.error('Aborting installation.');
  if (reason.command) {
    console.error(`  ${chalk.cyan(reason.command)} has failed.`);
  } else {
    console.error(chalk.red('Unexpected error. Please report it as a bug:'));
    console.log(reason);
  }
  process.exit(1);
});
