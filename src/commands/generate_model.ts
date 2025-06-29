import chalk from "chalk";
import fs from 'fs-extra';
import path from 'path';
import EntityTemplate from "../templates/entities.template";
import parseFields from "../utils/field_parser";
import inquirer from "inquirer";
import getValidatorTemplate from "../templates/validator.template";
import run from "../utils/run_npm_commands";

export async function generateModel(name: string, fieldsInput: string, withValidator: boolean = false) {
    const {feature} = await inquirer.prompt([{
        type: 'input',
        name: 'feature',
        message: "➤ Feature name (leave empty to use core):",
    },]);
    const basePath = feature ? path.join(process.cwd(), "src", "features", feature.toLowerCase()) : path.join(process.cwd(), "src", "core");

    const entityPath = path.join(basePath, 'domain', 'entities');
    const modelPath = path.join(basePath, 'data', 'models');
    const validatorPath = path.join(basePath, "application", "validators");

    await fs.ensureDir(entityPath);
    await fs.ensureDir(modelPath);

    const entityFile = path.join(entityPath, `${name}.entity.ts`);
    const modelFile = path.join(modelPath, `${name}.model.ts`);

    const entityTemplate = new EntityTemplate();
    const fields = parseFields(fieldsInput);

    await fs.outputFile(entityFile, entityTemplate.getEntityTemplate(name, fields));
    await fs.outputFile(modelFile, entityTemplate.getModelTemplate(name, fields));

    await fs.ensureDir(validatorPath);

    const validatorFile = path.join(validatorPath, `${name}.validator.ts`);
    if (withValidator) {
        await run("npm i zod");
        await fs.outputFile(validatorFile, getValidatorTemplate(name, fields));
        console.log(chalk.yellow(`⚙️ Validator created at: ${validatorFile}`));
    }

    console.log(chalk.green(`✅ Model for "${name}" generated successfully in ${feature || "core"} ${withValidator ? "with validator" : ""}!`));
}
