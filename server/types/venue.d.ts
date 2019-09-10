import * as mongoose from 'mongoose'
import { ObjectOf, Point } from 'types'

export interface IVenue {
  dateDiscovered: Date
  dateRegistered?: Date
  members: Map<string, string>
  googleMapsId: string
  location: any
  viewport: {
    northeast: Point
    southwest: Point
  }
  name: string
  food: [string]
  tags: [string]
  restrictMinors: boolean
  address: string
  municipality: string
  state: string
  country: string
  codeValidationSecret: {
    sum: number
    indexPair: number
  }
  initialLogo: string
  logo?: string
  priceLevel?: number
  visitedBy: [IVisit]
  campaigns: [ICampaign]
  lastSurveyed: Date,
}

export interface IVisit {
  id: mongoose.Schema.Types.ObjectId
  timestamp: Date
}
export interface ICampaign {
  label: string
  message: string
  description?: string
  startsOn?: Date
  endsOn?: Date
  restrictMinors?: boolean
  quota?: number
}