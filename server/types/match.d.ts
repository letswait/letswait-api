import * as mongoose from 'mongoose'
import { ObjectOf, Point } from '../types'

export interface IMatch {
  users: ObjectOf<UserMatched> // key/value pair with user _id and UserMatched enum
  chat: IChat[]
  dates: IDate[]
  state: MatchState
}

export interface IChat {
  sentTimestamp: Date
  readTimestamp: Date
  message: {
    text: string
    image?: string
    cloudfront?: string
    location?: ILocation
  }
  reactions: ObjectOf<Reaction> // key/value pair with user _id and reaction
}

export enum Reaction {
  weird = 'weird',
  love = 'love',
  excited = 'excited',
  like = 'like',
}

export interface ILocation {
  position: Point
  label?: string
  distance?: string
  address?: string
  image?: string
}

export enum MatchState {
  enqueue = 'enqueue',
  queued = 'queued',
  timeout = 'timeout',
  matched = 'matched',
  unmatched ='unmatched'
}

export enum UserMatched {
  queued = 'queued',
  accepted = 'accepted',
  rejected = 'rejected'
}

export interface IDate {
  location: ILocation,
  coupon: mongoose.Schema.Types.ObjectId
}