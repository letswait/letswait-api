'use strict'

import 'module-alias/register'

import chalk from 'chalk'
import config from './config'
import sidewalk from './library/sidewalk'

import * as mongoose from 'mongoose'

process.stdout.write('\n\n\n\n\n\n\n\n\n\n\n\n\n')

console.log(chalk.green(chalk.bgBlack('╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮')))
console.log(chalk.green(chalk.bgBlack('┆                                      ┆')))
console.log(chalk.green(chalk.bgBlack('┆        Starting NodeJS Server        ┆')))
console.log(chalk.green(chalk.bgBlack('┆                                      ┆')))
console.log(chalk.green(chalk.bgBlack('╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯')))

sidewalk.warning('Establishing connection to database')
mongoose.connect(config.mongo, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
}, (err: any) => {
  if(err) {
    sidewalk.error('There was an Error Connecting to the Database! :(', true)
  } else {
    sidewalk.success('Successfully connected to database')
    const app = require('./app')
  }
})
