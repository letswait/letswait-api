import * as mongoose from 'mongoose'
import { ObjectOf, Point } from '../types'

export interface IAction {
  userId: mongoose.Schema.Types.ObjectId,
  time: Date,
  type: string,
}
