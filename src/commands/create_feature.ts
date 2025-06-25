import fs, {ensureDir} from 'fs-extra';
import path from "node:path";
import chalk from "chalk";

export async function createFeature(featureName: string) {
    const basePath = path.join(process.cwd(), "src", "features", featureName);

    const folders = [
      'domain/entities',
      'domain/repositories',
        'domain/value_objects',
        'application/usecases',
        'application/dto',
        'interface/controllers',
        'interface/routes',
        'interface/validators',
        'infrastructure/repositories/',
    ];

    try {
        for (const folder of folders) {
            const folderPath = path.join(basePath, folder);
            await fs.ensureDir(folderPath);

            const parts = folder.split('/');
            const leafName = parts[parts.length - 1];

            const fileName = `${featureName}.${leafName}.ts`;
            const filePath = path.join(folderPath, fileName);

            const content = `// ${capitalize(featureName)} ${capitalize(leafName)}\n\nexport class ${capitalize(featureName)}${capitalize(camelCase(leafName))} {}\n`;
            await fs.outputFile(filePath, content);
        }

        console.log(chalk.green(`✅ Feature "${featureName}" structure created successfully!`));
    } catch (e) {
        console.error(chalk.red(`❌ Error creating ${featureName} feature: ${e}`));
    }
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str: string): string {
    return str
        .split('-')
        .map((word) => capitalize(word))
        .join('');
}
