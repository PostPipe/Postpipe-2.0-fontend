#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const prompts_1 = __importDefault(require("prompts"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
let projectPath = '';
program
    .name('create-postpipe-connector')
    .description('Scaffold a PostPipe 2.0 Connector')
    .arguments('[project-directory]')
    .action((name) => {
    projectPath = name;
})
    .parse(process.argv);
async function run() {
    console.log(chalk_1.default.bold.blue('🚀 PostPipe 2.0 Connector Wizard'));
    console.log(chalk_1.default.gray('Zero-trust, credential-safe ingestion system.'));
    console.log();
    if (!projectPath) {
        const res = await (0, prompts_1.default)({
            type: 'text',
            name: 'path',
            message: 'Where should we create the connector?',
            initial: 'my-connector'
        });
        projectPath = res.path;
    }
    if (!projectPath)
        process.exit(1);
    const root = path_1.default.resolve(projectPath);
    const appName = path_1.default.basename(root);
    // 1. Wizard
    const response = await (0, prompts_1.default)([
        {
            type: 'select',
            name: 'dbType',
            message: 'Which database will you use?',
            choices: [
                { title: 'MongoDB (Recommended)', value: 'mongodb' },
                { title: 'PostgreSQL', value: 'postgres' },
                { title: 'Supabase', value: 'supabase' },
                { title: 'SQLite (Development)', value: 'sqlite' },
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
    if (!response.dbType || !response.deployment)
        process.exit(1);
    // 2. Scaffold
    console.log();
    console.log(`Creating connector in ${chalk_1.default.green(root)}...`);
    fs_extra_1.default.ensureDirSync(root);
    const templateDir = path_1.default.join(__dirname, '../templates/default');
    fs_extra_1.default.copySync(templateDir, root);
    // 3. Customize Package.json
    const pkgPath = path_1.default.join(root, 'package.json');
    const pkg = JSON.parse(fs_extra_1.default.readFileSync(pkgPath, 'utf-8'));
    pkg.name = appName;
    // Add dependencies based on DB
    const dependencies = {
        "express": "^4.18.2",
        "dotenv": "^16.3.1"
    };
    const devDeps = {
        "@types/express": "^4.17.17",
        "@types/node": "^20.5.0",
        "typescript": "^5.1.6",
        "ts-node": "^10.9.1",
        "nodemon": "^3.0.1"
    };
    if (response.dbType === 'mongodb') {
        dependencies['mongodb'] = '^5.7.0';
        // Remove other adapters to prevent TS errors
        fs_extra_1.default.removeSync(path_1.default.join(root, 'src/lib/db/postgres.ts'));
        fs_extra_1.default.removeSync(path_1.default.join(root, 'src/lib/db/supabase.ts'));
    }
    else if (response.dbType === 'postgres') {
        dependencies['pg'] = '^8.11.3';
        devDeps['@types/pg'] = '^8.10.2';
        fs_extra_1.default.removeSync(path_1.default.join(root, 'src/lib/db/mongodb.ts'));
        fs_extra_1.default.removeSync(path_1.default.join(root, 'src/lib/db/supabase.ts'));
    }
    else if (response.dbType === 'supabase') {
        dependencies['@supabase/supabase-js'] = '^2.32.0';
        fs_extra_1.default.removeSync(path_1.default.join(root, 'src/lib/db/mongodb.ts'));
        fs_extra_1.default.removeSync(path_1.default.join(root, 'src/lib/db/postgres.ts'));
    }
    pkg.dependencies = { ...pkg.dependencies, ...dependencies };
    pkg.devDependencies = { ...pkg.devDependencies, ...devDeps };
    fs_extra_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
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
    fs_extra_1.default.writeFileSync(path_1.default.join(root, '.env'), envContent);
    fs_extra_1.default.writeFileSync(path_1.default.join(root, '.env.example'), envContent);
    // 5. Success
    console.log();
    console.log(chalk_1.default.green('Success! Created connector.'));
    console.log();
    console.log('Next steps:');
    console.log(chalk_1.default.cyan(`  cd ${projectPath}`));
    console.log(chalk_1.default.cyan('  npm install'));
    console.log(chalk_1.default.cyan('  # Fill in .env with your secrets'));
    console.log(chalk_1.default.cyan('  npm run dev'));
    console.log();
    console.log(chalk_1.default.yellow.bold('IMPORTANT SECURITY NOTICE:'));
    console.log(chalk_1.default.yellow('  This connector is the GATEKEEPER to your database.'));
    console.log(chalk_1.default.yellow('  Ensure POSTPIPE_CONNECTOR_SECRET is strong and rotated if leaked.'));
    console.log();
}
run().catch((reason) => {
    console.error('Aborting installation.');
    if (reason.command) {
        console.error(`  ${chalk_1.default.cyan(reason.command)} has failed.`);
    }
    else {
        console.error(chalk_1.default.red('Unexpected error. Please report it as a bug:'));
        console.log(reason);
    }
    process.exit(1);
});
