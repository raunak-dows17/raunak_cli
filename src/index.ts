#!/usr/bin/env node

import {Command} from 'commander';
import {createFeature} from "./commands/create_feature";
import {initProject} from "./commands/init";

const program = new Command();

program.name('raunak').description("A cli to generate clean architecture").version("0.1.0");

program.command('hello').description("Say Hello").action(() => {
    console.log("👋 Hello from Raunak CLI!");
});

program.command('create-feature <name>').description("Generate clean architecture boilerplate for a feature").action(createFeature);

program.command('init').description('Scaffold a new clean architecture project').action(initProject);

program.parse();
