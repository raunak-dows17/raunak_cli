import {exec} from "child_process";
import chalk from "chalk";

export default function run(cmd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(stderr);
            console.log(chalk.gray(stdout));
            resolve();
        });
    });
}
