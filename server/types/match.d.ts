import * as mongoose from 'mongoose'
import { ObjectOf, Point } from '../types'

export interface IMatch {
  _id: any,
  timestamp?: Date,
  users: Map<string, UserMatched> // key/value pair with user _id and UserMatched enum
  chat: IChat[]
  dates: IDate[]
  userProfiles: [mongoose.Schema.Types.ObjectId, mongoose.Schema.Types.ObjectId]
  state: MatchState
}

export interface IChat {
  _id?: string,
  sentTimestamp: Date
  readTimestamp?: Date
  user: string
  message: IMessage
  reactions: Map<string, Reaction> // key/value pair with user _id and reaction
}

export interface IMessage {
  text?: string
  image?: string
  video?: string
  location?: Point
  campaignId?: String
}

export type Reaction = 'weird' | 'love' | 'excited' | 'like'

export type MatchState =
    'queued'
  | 'timeout'
  | 'matched'
  | 'unmatched'
  | 'blocked'
  | 'suspend'
  | 'suspended'

export type UserMatched =
    'queued'
  | 'accepted'
  | 'rejected'

export interface IDate {
  venue: mongoose.Schema.Types.ObjectId
  campaignId: string,
  expiresOn: Date,
  code: string,
  consumed: boolean,
}
