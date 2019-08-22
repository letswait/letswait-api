import * as moment from 'moment'
import {
  Document,
  Model,
  model,
  Schema,
} from 'mongoose'

import { IMatch } from '../types/match'

export interface IMatchModel extends IMatch, Document {
}

export let MatchSchema = new Schema({
  users: { type: Map, of: String },
  timestamp: { type: Date, default: Date.now() },
  chat: [{
    sentTimestamp: { type: Date, default: Date.now() },
    readTimestamp: Date,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: {
      text: { type: String, required: true },
      images: [String],
      cloudfront: String,
      location: {
        type: { type: String },
        coordinates: [],
      },
    },
    reactions: { type: Map, of: String }, // key/value pair with user _id and reaction
  }],
  dates: [{
    venue: { type: Schema.Types.ObjectId, ref: 'Venue'},
    logo: String,
    name: String,
    location: {
      type: { type: String },
      coordinates: [],
    },
    campaignId: String,
    expiresOn: { type: Date, default: moment().add(7, 'days').toDate() },
    code: String,
    consumed: { type: Boolean, default: false },
  }],
  userProfiles: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  state: { type: String, default: 'queued' }
})

MatchSchema.index({ 'dates.location': "2dsphere" });
MatchSchema.index({ 'chat.message.location': "2dsphere" });

MatchSchema.set('toObject', { virtuals: true })
MatchSchema.set('toJSON', { virtuals: true })

export const Match: Model<IMatchModel> = model<IMatchModel>('Match', MatchSchema)