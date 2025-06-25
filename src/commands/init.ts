import chalk from "chalk";
import {exec} from 'child_process';
import path from "node:path";
import fs from "fs-extra";

export  async  function initProject() {
    console.log(chalk.cyan("🔧 Initializing project..."));

    await run('npm init -y');

    console.log(chalk.yellow('📦 Installing dependencies...'));

    await run('npm install express cors dotenv mongoose jsonwebtoken');
    await run('npm install --save-dev tsx typescript @types/express @types/node');
    await run('npx tsc --init');

    const base = path.join(process.cwd(), 'src');
    const folders = ['config', 'core/middleware', 'root'];

    for (const folder of folders) {
        await fs.ensureDir(path.join(base, folder));
    }

    console.log(chalk.yellow('📂 Creating project structure...'));

    await fs.writeFile('tsconfig.json', tsConfig);
    await fs.outputFile(path.join(base, 'config/env.config.ts'), envConfig);
    await fs.outputFile(path.join(base, 'config/db.config.ts'), dbConfig);
    await fs.outputFile(path.join(base, 'core/middleware/api_response.ts'), apiResponse);
    await fs.outputFile(path.join(base, 'root/app.ts'), appFile);
    await fs.outputFile(path.join(base, 'root/server.ts'), serverFile);
    await fs.outputFile('.env', defaultEnv);

    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = await fs.readJson(pkgPath);

    console.log(chalk.yellow('📄 Updating package.json...'));

    pkg.scripts = {
        ...pkg.scripts,
        start: 'node --loader ts-node/esm src/root/server.ts',
        dev: 'tsx src/root/server.ts',
        build: 'tsc'
    }

    await fs.writeJson(pkgPath, pkg, {spaces: 2});

    console.log(chalk.green('✅ Project initialized successfully!'));
}


function run(cmd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(stderr);
            console.log(chalk.gray(stdout));
            resolve();
        });
    });
}

const tsConfig = `{
  "compilerOptions": {
    "target": "ES2024",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`;

const dbConfig = `import {connect} from 'mongoose';

export async function connectDB(dbURI: string) {
    try {
       await connect(dbURI);
        console.log('✅ Database connected successfully');
    } catch (e) {
        console.log(\`❌ Error connecting to database: \${e}\`);
    }
}
`

const envConfig = `import { config } from "dotenv";

config();

interface Config {
    port: number;
    nodeEnv: string;
    dbURI: string;
}

const envConfig: Config = {
    port: Number(process.env.PORT) || 9696,
    nodeEnv: process.env.NODE_ENV || "development",
    dbURI: process.env.DB_URI || "mongodb://localhost:27017/portfolio"
}

export default envConfig;
`;

const serverFile = `import { Server } from "node:http";
import app from "./app";
import envConfig from "../config/env.config";
import {connectDB} from "../config/db.config";


const server = new Server(app);

connectDB(envConfig.dbURI).then();

server.listen(envConfig.port, () => {
    console.log(\`🚀 Server running at http://localhost:\${envConfig.port}\`);
});
`;

const appFile = `import express from "express";
import apiResponse from "../core/middleware/api_response";

const app = express();

app.use(express.json());
app.use(apiResponse);

app.get("/", (req, res) => {
    return res.success("Welcome to the server", null);
});

export default app;
`;

const apiResponse = `import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Response {
      success: (message: string, data: any) => void;
      error: (message: string, data: any) => void;
    }
  }
}

export default function apiResponse(req: Request, res: Response, next: NextFunction) {
  res.success = function (message: string, data: any) {
    res.json({ status: true, message, data });
  };

  res.error = function (message: string, data: any) {
    res.json({ status: false, message, data });
  };

  next();
}
`;

const defaultEnv = `PORT=6969
NODE_ENV=development
DB_URI=mongodb://localhost:27017/db_name
`;
