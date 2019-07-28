'use strict'

import chalk from 'chalk'
import config from './config'

import * as mongoose from 'mongoose'

process.stdout.write('\x1B[2J\x1B[0f\n')

console.log(chalk.green(chalk.bgBlack('╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮')))
console.log(chalk.green(chalk.bgBlack('┆                                      ┆')))
console.log(chalk.green(chalk.bgBlack('┆        Starting NodeJS Server        ┆')))
console.log(chalk.green(chalk.bgBlack('┆                                      ┆')))
console.log(chalk.green(chalk.bgBlack('╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯')))

console.log(chalk.yellow('Connecting to MongoDB...'))
mongoose.connect(config.mongo, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
}, (err: any) => {
  if(err) {
    console.log(chalk.red('There was an Error Connecting to the Database! :('))
  } else {
    console.log(chalk.green('Successfully Connected to the Database! :D'))
    const app = require('./app')
  }
})
