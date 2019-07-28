import * as mongoose from 'mongoose'
import { ObjectOf, Point } from 'types'

export interface IUser {
  admin: boolean
  name?: string
  birth?: Date
  facebookId?: string
  sms?: string
  smsVerified?: boolean
  significantOther?: string
  created: Date
  registered?: Date
  devices?: Map<string, IUserDevice>
  tokens: number
  matches?: mongoose.Schema.Types.ObjectId
  lastLocation?: Point
  lastLocationDisplayName?: string
  profile: {
    gender?: string
    images?: [string, string?, string?, string?, string?, string?]
    food?: string[]
    goal?: 'exclusive' | 'unsure' | 'casual' | 'serious'
    work: {
      position: string
      employer: string
    }
    aboutMe: string
    school: {
      name: string,
      graduationYear?: number
    }
    questions: [string, string][]
    height?: number // Height in Centimeters
  }
  searchSettings: {
    sexualPreference?: 'male' | 'female' | 'everyone'
    // Radius in Miles
    radius: number 
    ageRange: [number, number]
  }
  feed?: mongoose.Schema.Types.ObjectId[]
  swipeFitness?: number
  actions?: ObjectOf<IUserAction[]> // [ id: Action[] ]
  isBot?: boolean
  botBehavior?: Map<string, boolean>
}

export enum UserDeviceOS {
  'ios' = 'ios',
  'android' = 'android',
  'other' = 'other'
}

/**
 * @interface IUserDevice
 * @description - All Devices are stored as an object
 *                where its key is the device UUID
 */
export interface IUserDevice {
  activeCode?: string
  codeValid?: boolean
  lastLogin?: Date
  accessToken?: string
  expiresOn?: Date
  refreshToken?: string
  token: string
  os: UserDeviceOS
}

/**
 * @interface IUserAction
 * @description - loosely describes user action for
 *                later ai data. stored in an array
 *                representing the day the action
 *                was taken.
 */
export interface IUserAction {
  time: Date
  type: string
  user: mongoose.Schema.Types.ObjectId
}
