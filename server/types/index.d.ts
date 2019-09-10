export interface ObjectOf<T> {[key: string]: T}

export type Point = {
  type: "Point"
  coordinates: [number, number]
}

// export enum Food {
//   alcohol = 'alcohol',
//   burgers = 'burgers',
//   chinese = 'chinese',
//   fusion = 'fusion',
//   healthy = 'healthy',
//   italian = 'italian',
//   pizza = 'pizza',
//   seafood = 'seafood',
//   steakhouse = 'steakhouse',
//   sushi = 'sushi',
//   mexican = 'mexican',
//   thai = 'thai',
// }

export interface IWheelSegment {
  logo: string
  name: string
  venueId?: string
  campaignId?: string
  priceLevel?: number
  message?: string
  code?: string
}
export interface IWheel {
  segments: IWheelSegment[]
  chosenSegment: number
}
