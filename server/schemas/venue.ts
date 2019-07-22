import {
  Document,
  Model,
  model,
  Schema,
} from 'mongoose'

// import { IVenue } from '../types/venue'

// export interface IVenueModel extends IVenue, Document {
  // profileCompleted: boolean
// }

export let VenueSchema = new Schema({

})

// VenueSchema.methods.foobar = (
//   cb: (error: any, message: string) => any
// ) => {
//   cb(undefined, 'foobar')
// }

// VenueSchema.virtual('setupCompleted').get(() => {
//   return (
//     true
//   )
// })

// export const Venue: Model<IVenueModel> = model<IVenueModel>('Venue', VenueSchema)