import * as moment from 'moment'
import {
  Document,
  Model,
  model,
  Schema,
} from 'mongoose'

import { IAction } from '../types/action'

export interface IActionModel extends IAction, Document {
}

export let ActionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  time: { type: Date, default: Date.now() },
  type: { type: String, required: true },
})

export const Action: Model<IActionModel> = model<IActionModel>('Action', ActionSchema)