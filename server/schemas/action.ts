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
  actionType: { type: String, required: true },
  actionState: { type: String, default: 'unset' },
  timestamp: { type: Date, default: Date.now() },
  incitingUser: { type: Schema.Types.ObjectId, ref: 'User', required: true},
  involvedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  venue: { type: Schema.Types.ObjectId, ref: 'Venue' },
  match: { type: Schema.Types.ObjectId, ref: 'Match' },
  extraData: Schema.Types.Mixed,
  notes: [{
    timestamp: { type: Date, default: Date.now() },
    comment: { type: String, required: true },
    extraData: Schema.Types.Mixed,
  }]
})

export const Action: Model<IActionModel> = model<IActionModel>('Action', ActionSchema)