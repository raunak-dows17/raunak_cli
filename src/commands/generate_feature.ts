import fs, {ensureDir} from 'fs-extra';
import path from "node:path";
import chalk from "chalk";
import StringsUtils from "../utils/strings.utils";

export async function generateFeature(featureName: string) {
    const stringUtils = new StringsUtils();

    const basePath = path.join(process.cwd(), "src", "features", featureName);

    const folders = [
        'domain/entities',
        'domain/repositories',
        'domain/usecases',
        'data/repositories',
        'data/models',
        'application/controllers',
        'application/routes',
        'application/validators'
    ];

    try {
        for (const folder of folders) {
            const folderPath = path.join(basePath, folder);
            await fs.ensureDir(folderPath);

            const parts = folder.split('/');
            const leafName = parts[parts.length - 1];

            const fileName = `${featureName}.${leafName}.ts`;
            const filePath = path.join(folderPath, fileName);

            const content = `// ${stringUtils.capitalize(featureName)} ${stringUtils.capitalize(leafName)}\n\nexport default class ${stringUtils.capitalize(featureName)}${stringUtils.capitalize(stringUtils.camelCase(leafName))} {}\n`;
            await fs.outputFile(filePath, content);
        }

        console.log(chalk.green(`✅ Feature "${featureName}" structure created successfully!`));
    } catch (e) {
        console.error(chalk.red(`❌ Error creating ${featureName} feature: ${e}`));
    }
}
