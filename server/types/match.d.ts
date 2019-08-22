import * as mongoose from 'mongoose'
import { ObjectOf, Point } from '../types'

export interface IMatch {
  timestamp?: Date,
  users: Map<string, UserMatched> // key/value pair with user _id and UserMatched enum
  chat: IChat[]
  dates: IDate[]
  userProfiles: [mongoose.Schema.Types.ObjectId, mongoose.Schema.Types.ObjectId]
  state: MatchState
}

export interface IChat {
  sentTimestamp: Date
  readTimestamp?: Date
  user: string
  message: {
    text: string
    images?: string[]
    cloudfront?: string
    location?: Point
  }
  reactions: Map<string, Reaction> // key/value pair with user _id and reaction
}

export enum Reaction {
  weird = 'weird',
  love = 'love',
  excited = 'excited',
  like = 'like',
}

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
  logo: string,
  name: string,
  location: Point
  campaignId: string,
  expiresOn: Date,
  code: string,
  consumed: boolean,
}
