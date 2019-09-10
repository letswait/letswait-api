import * as moment from 'moment'
import {
  Document,
  Model,
  model,
  Schema,
  Types,
} from 'mongoose'

import { IUserDocument } from '../types/user'
import { genRandomNumbers } from 'library/util';
import { IMatchModel } from './match';

import { pointSchema, deviceSchema } from './subdocs'

export interface IUser extends IUserDocument {
  setupCompleted: boolean,
  age: number,
  hasMatchWith(candidateId: string): string | undefined; 
}

export interface IUserModel extends Model<IUser> {
}

export let UserSchema = new Schema({
  admin: { type: Boolean, default: false },
  name: String,
  birth: Date,
  facebookId: String,
  significantOther: String,
  sms: String,
  smsVerified: Boolean,
  created: { type: Date, default: Date.now() },
  registered: Date,
  devices: [deviceSchema],
  tokens: { type: Number, default: 3 },
  matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
  lastLocation: {
    type: pointSchema,
    required: false,
  },
  lastLocationDisplayName: String,
  hideProfile: { type: Boolean, default: false },
  profile: {
    gender: String,
    images: [String],
    food: [String],
    goal: { type: String, enum: ['exclusive','unsure','casual','serious']},
    work: {
      position: { type: String, default: '' },
      employer: { type: String, default: '' },
    },
    aboutMe: { type: String, default: '' },
    school: {
      name: { type: String, default: '' },
      graduationYear: Number,
    },
    questions: Schema.Types.Mixed,
    height: Number,
  },
  searchSettings: {
    sexualPreference: { type: String, enum: ['male', 'female', 'everyone'] },
    radius: { type: Number, min: 10, max: 100, default: 50 },
    ageRange: [{ type: Number, min: 18, max: 100, default: [18,32] }],
  },
  swipeFitness: { type: Number, default: 0.7 },
  volatility: { type: Number, default: 0 },
  volatileActions: [{ type: Schema.Types.ObjectId, ref: 'Action'}],
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  actions: [{ type: Schema.Types.ObjectId, ref: 'Action'}],
  isBot: Boolean,
  botBehavior: {
    swipesRight: Boolean,
    plansAhead: Boolean,
    enthusiastic: Boolean,
    punctual: Boolean,
  },
  /**
   * @todo in the future we could store feeds to be recalled later, as long as their not too old
   */
  // savedFeeds: { type: Map, of: {
  //   searchSettings: {
  //     sexualPreference: { type: String, enum: ['male', 'female', 'everyone']},
  //     radius: { type: Number, min: 10, max: 100, default: 50 },
  //     ageRange: [{ type: Number, min: 18, max: 100 }],
  //   },
  //   dateLastUpdated: { type: Date, default: Date.now() },
  //   feed: [
  //     Schema.Types.ObjectId
  //   ]
  // }},
})

UserSchema.index({ 'lastLocation': "2dsphere" })

UserSchema.set('toObject', { virtuals: true })
UserSchema.set('toJSON', { virtuals: true })

// UserSchema.pre('save', (next) => {
//   if(this.searchSettings && this.searchSettings.ageRange.length) {
//     this.searchSettings.ageRange[0] = Math.min(Math.max(18, this.searchSettings.ageRange[0]),100)
//     this.searchSettings.ageRange[1] = Math.min(Math.max(22, this.searchSettings.ageRange[1]),100)
//   }
//   // check if setup is completed
//   if(!this.registered) {
//     const shouldBeRegistered = (
//       this.profile &&
//       this.searchSettings &&
//       this.profile.gender &&
//       this.searchSettings.sexualPreference &&
//       this.profile.images.length > 0 &&
//       this.profile.food.length > 0 &&
//       (this as any).name &&
//       this.birth &&
//       this.profile.goal
//     )
//     if(shouldBeRegistered) {
//       this.registered = Date
//     }
//   } 
//   next()
// })

UserSchema.virtual('age').get(function() {
  const birth = moment(this.birth)
  if(birth.isValid()) return Math.abs(birth.diff(moment(), 'years'))
  return undefined
})

UserSchema.methods.hasMatchWith = async function(candidateId: string) {
  await this.populate({
    path: 'matches',
    match: {
      userProfiles: Types.ObjectId(candidateId)
    },
  }, function (err, user) {
    // console.log('Got Populated MAtches', err, user)
    if(err || !user) return undefined
    // console.log(user.matches)
    const { matches } = user
    if(matches && matches[0]) return matches[0].state
    return undefined
  })
}

export const User: IUserModel = model<IUser, IUserModel>('User', UserSchema)
