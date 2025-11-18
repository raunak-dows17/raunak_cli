import chalk from "chalk";
import path from "node:path";
import fs from "fs-extra";
import InitTemplate from "../templates/init.template";
import run from "../utils/run_npm_commands";
import inquirer from "inquirer";

export async function initProject(withValidator: boolean = false) {
    const {socket} = await inquirer.prompt([{
        type: 'confirm',
        name: 'socket',
        message: "➤ Include socket.io?",
        default: false,
    },]);

    console.log(chalk.cyan("🔧 Initializing project..."));

    await run('npm init -y');

    console.log(chalk.yellow('📦 Installing dependencies...'));

    await run('npm install express cors dotenv mongoose jsonwebtoken bcrypt multer raw_lib socket.io uuid zod');
    await run('npm install --save-dev tsx typescript @types/express @types/node @types/bcrypt @types/jsonwebtoken @types/multer @types/uuid');

    if (withValidator) {
        console.log(chalk.blue("🧩 Adding Zod for validators..."));
        await run("npm install zod");
    }

    await run('npx tsc --init');

    const base = path.join(process.cwd(), 'src');
    const folders = ['config', 'infrastructure/web', 'shared/infrastructure/database', 'shared/infrastructure/middleware'];

    for (const folder of folders) {
        await fs.ensureDir(path.join(base, folder));
    }

    console.log(chalk.yellow('📂 Creating project structure...'));

    await fs.writeFile('tsconfig.json', InitTemplate.tsConfig);
    await fs.outputFile(path.join(base, 'config/env.config.ts'), InitTemplate.envConfig);
    await fs.outputFile(path.join(base, 'config/multer.config.ts'), InitTemplate.mediaConfig);
    await fs.outputFile(path.join(base, 'shared/infrastructure/database/connection.ts'), InitTemplate.dbConnection);
    await fs.outputFile(path.join(base, 'shared/infrastructure/middleware/api_response.ts'), InitTemplate.apiResponse);
    await fs.outputFile(path.join(base, 'shared/infrastructure/middleware/media.middleware.ts'), InitTemplate.mediaSaveMiddleware);
    await fs.outputFile(path.join(base, 'shared/media/domain/entities/media.entity.ts'), InitTemplate.mediaEntity);
    await fs.outputFile(path.join(base, 'shared/media/domain/repositories/media.repository.ts'), InitTemplate.mediaRepository);
    await fs.outputFile(path.join(base, 'shared/media/domain/usecases/mediaOperation.usecases.ts'), InitTemplate.mediaOperationUsecases);
    await fs.outputFile(path.join(base, 'shared/media/data/models/media.model.ts'), InitTemplate.mediaModel);
    await fs.outputFile(path.join(base, 'shared/media/data/services/media.services.ts'), InitTemplate.mediaServices);
    await fs.outputFile(path.join(base, 'shared/media/application/controllers/media.controllers.ts'), InitTemplate.mediaControllers);
    await fs.outputFile(path.join(base, 'infrastructure/web/http.ts'), InitTemplate.appFile);
    await fs.outputFile(path.join(base, 'server.ts'), InitTemplate.serverFile(socket));
    await fs.outputFile('.env', InitTemplate.defaultEnv);

    if (socket) {
        console.log(chalk.blue("🧩 Adding socket.io for socket..."));

        await run('npm install socket.io');

        await fs.outputFile(path.join(base, 'infrastructure/web/socket.ts'), InitTemplate.socketFile);
    }

    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = await fs.readJson(pkgPath);

    pkg.scripts = {
        ...pkg.scripts,
        start: 'node --loader ts-node/esm src/root/server.ts',
        dev: 'tsx src/server.ts',
        build: 'tsc'
    }

    await fs.writeJson(pkgPath, pkg, {spaces: 2});

    console.log(chalk.green('✅ Project initialized successfully!'));
    console.log(chalk.yellow("📖 Update the db_name or DB_URI in .env file"));
    console.log(chalk.yellow("🚀 Run 'npm run dev' to start the server."));
}
