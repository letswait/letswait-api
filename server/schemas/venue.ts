import * as moment from 'moment'
import {
  Document,
  Model,
  model,
  Schema,
} from 'mongoose'

import { IVenue } from '../types/venue'

import { pointSchema } from './subdocs'

export interface IVenueModel extends IVenue, Document {
}

export let VenueSchema = new Schema({
  dateDiscovered: { type: Date, default: Date.now() },
  dateRegistered: Date,
  members: { type: Map, of: String },
  googleMapsId: { type: String, required: true },
  location: {
    type: pointSchema,
    required: true,
  },
  // location: { type: [Number], index: '2dsphere', default: [0.0, 0.0]},
  viewport: {
    northeast: {
      type: pointSchema,
      required: true,
    },
    southwest: {
      type: pointSchema,
      required: true,
    },
  },
  food: [String],
  tags: [String],
  name: String,
  restrictMinors: { type: Boolean, default: false },
  address: { type: String, default: '' },
  municipality: { type: String, required: true },
  state: { type: String, default: '', required: true },
  country: { type: String, required: true },
  initialLogo: { type: String, required: true },
  logo: { type: String, default: '' },
  priceLevel: Number,
  visitedBy: [{
    id: { type: Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now() }
  }],
  // This is a code validation where the specified index pairs will always equal
  codeValidationSecret: {
    // This sum algorithm describes a number between 2 and 16 (inclusive)
    sum: { type: Number, default: Math.min(14, Math.floor(Math.random() *  15) + 2)},
    // Index pair to check, each index pair is 2 indices away from each other, eg: [1, 2, 3, 1, 2, 3]
    indexPair: { type: Number, default: Math.min(3, Math.floor(Math.random() * 4)) },
  },
  campaigns: [{
    label: { type: String, required: true },
    description: { type: String, default: '' },
    startsOn: Date,
    endsOn: Date,
    restrictMinors: { type: Boolean, default: false },
    quota: { type: Number, default: 0 },
    message: { type: String, required: true }
  }],
  lastSurveyed: {type: Date, default: new Date()},
})

VenueSchema.index({ location: "2dsphere" });
VenueSchema.index({ 'viewport.southwest': "2dsphere" })
VenueSchema.index({ 'viewport.northeast': "2dsphere" })

export const Venue: Model<IVenueModel> = model<IVenueModel>('Venue', VenueSchema)