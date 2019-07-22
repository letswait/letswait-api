'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const config_1 = require("./config");
const mongoose = require("mongoose");
process.stdout.write('\x1B[2J\x1B[0f\n');
console.log(chalk_1.default.green(chalk_1.default.bgBlack('╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮')));
console.log(chalk_1.default.green(chalk_1.default.bgBlack('┆                                      ┆')));
console.log(chalk_1.default.green(chalk_1.default.bgBlack('┆        Starting NodeJS Server        ┆')));
console.log(chalk_1.default.green(chalk_1.default.bgBlack('┆                                      ┆')));
console.log(chalk_1.default.green(chalk_1.default.bgBlack('╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯')));
console.log(chalk_1.default.yellow('Connecting to MongoDB...'));
mongoose.connect(config_1.default.mongo, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log(chalk_1.default.red('There was an Error Connecting to the Database! :('));
    }
    else {
        console.log(chalk_1.default.green('Successfully Connected to the Database! :D'));
        const app = require('./app');
    }
});
//# sourceMappingURL=server.js.map