import * as mongoose from 'mongoose'
import { ObjectOf, Point } from '../types'

export interface IAction {
  userId: mongoose.Schema.Types.ObjectId,
  time: Date,
  type: string,
}

export interface Action {
  actionType: string
  actionState: string
  timestamp: Date
  incitingUser: mongoose.Schema.Types.ObjectId
  involvedUsers?: mongoose.Schema.Types.ObjectId
  venue?: mongoose.Schema.Types.ObjectId
  match?: mongoose.Schema.Types.ObjectId
  extraData?: any
  notes?: INote[]
}

interface INote {
  timestamp: Date
  comment: string,
  extraData?: any,
}