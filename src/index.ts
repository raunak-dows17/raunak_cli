#!/usr/bin/env node

import {Command} from 'commander';
import {initProject} from "./commands/init";
import {generateModel} from "./commands/generate_model";
import {generateFeature} from "./commands/generate_feature";

const program = new Command();

program.name('raunak').description("A cli to generate clean architecture").version("0.1.0");

program.command('hello').description("Say Hello").action(() => {
    console.log("👋 Hello from Raunak CLI!");
});

program.command('init').description('Scaffold a new clean architecture project').option("--with-validator", "Include zod validators in the project").action((options) => initProject(options.withValidator));

program.command('generate:feature <name>').description("Generate clean architecture boilerplate for a feature").action(generateFeature);

program.command('generate:model').argument('<name>', "Name of the model").requiredOption('--fields <fields>', "Comma-separated list of fields like name:string, age:number").option("--with-validator", "Also Generate a Zod validator").description("Generate entity and mongoose model for a feature").action((name, options) => {

    if (!options.fields) {
        console.error("❌ Error: --fields is required",);
        process.exit(1);
    }

    generateModel(name, options.fields, options.withValidator).then(_ => {
    });
});

program.parse();
