import { Schema } from 'mongoose'

export const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
})

export const deviceSchema = new Schema({
  _id: String,
  activeCode: String,
  lastLogin: Date,
  codeValid: Boolean,
  expiresOn: Date,
  accessToken: String,
  refreshToken: String,
  token: { type: String, default: '' },
  os: {
    type: String,
    enum: ['ios','android','other', 'unset'],
    default: 'unset'
  },
})