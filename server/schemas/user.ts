import * as moment from 'moment'
import {
  Document,
  Model,
  model,
  Schema,
} from 'mongoose'

import { IUser } from '../types/user'
import { genRandomNumbers } from 'library/util';

export interface IUserModel extends IUser, Document {
  setupCompleted: boolean,
  age: number,
}

export let UserSchema = new Schema({
  admin: { type: Boolean, default: false },
  name: String,
  birth: Date ,
  facebookId: String,
  significantOther: String,
  sms: String,
  smsVerified: Boolean,
  created: { type: Date, default: Date.now },
  registered: Date,
  devices: {type: Map, of: {
    activeCode: String,
    lastLogin: Date,
    codeValid: Boolean,
    expiresOn: Date,
    accessToken: String,
    refreshToken: String,
    token: { type: String, default: '' },
    os: { type: String, enum: ['ios','android','other'], default: 'other' },
  },
  validate: function(map) {
    return true
  }},
  tokens: { type: Number, default: 3 },
  matches: [ Schema.Types.ObjectId ],
  lastLocation: { type: [Number], index: '2dsphere' },
  lastLocationDisplayName: String,
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
    questions: [
      [String, String]
    ],
    height: Number,
  },
  searchSettings: {
    sexualPreference: { type: String, enum: ['male','female', 'everyone'] },
    radius: { type: Number, min: 10, max: 100, default: 50 },
    ageRange: [{ type: Number, min: 18, max: 100 }],
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
  swipeFitness: Number,
  feed: [Schema.Types.ObjectId],
  actions: { type: Map, of: { //Key name is UNIX Date string
    time: { type: Date, default: Date.now },
    type: { type: String, required: true },
    user: Schema.Types.ObjectId
  }},
})

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

// UserSchema.methods.foobar = (
//   cb: (error: any, message: string) => any
// ) => {
//   cb(undefined, 'foobar')
// }

UserSchema.virtual('age').get(() => {
  return this.birth ? moment(this.birth).diff(moment(), 'years') : undefined
})

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema)
