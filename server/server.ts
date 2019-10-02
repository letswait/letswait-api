'use strict'

require('module-alias/register')
const dotenv = require('dotenv').config();

import chalk from 'chalk'
import sidewalk from './library/sidewalk'

import * as mongoose from 'mongoose'

process.stdout.write('\n\n\n\n\n\n\n\n\n\n\n\n\n')

console.log(chalk.green(chalk.bgBlack('╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮')))
console.log(chalk.green(chalk.bgBlack('┆                                      ┆')))
console.log(chalk.green(chalk.bgBlack('┆        Starting NodeJS Server        ┆')))
console.log(chalk.green(chalk.bgBlack('┆                                      ┆')))
console.log(chalk.green(chalk.bgBlack('╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯')))

sidewalk.warning('Establishing connection to database')
mongoose.connect(process.env.MONGO_URL, {
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
