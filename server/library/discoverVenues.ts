import { Venue } from '../schemas'
import googleMapsClient from './maps'
import { IVenueModel } from '../schemas/venue'
import sidewalk from './sidewalk'

export default async function discoverVenues(location: number[]): Promise<number> {
  sidewalk.warning('Generating Shadow Venues')
  return await (googleMapsClient as any).placesNearby({
    location,
    language: 'en',
    radius: 50000,
    type: 'restaurant',
  }).asPromise().then(async (response): Promise<number> => {
    sidewalk.warning('VENUES')
    if(response && response.json && response.json.results && response.json.results.length) {
      const results = response.json.results
      let newVenues: IVenueModel[] = []
      for(let i = results.length; i--;) {
        const existingVenue = await Venue.findOne({ googleMapsId: results[i].place_id }).lean()
        if(!existingVenue) {
          const res = results[i]
          newVenues = newVenues.concat([ new Venue({
            location: {
              type: 'Point',
              coordinates: [res.geometry.location.lng, res.geometry.location.lat],
            },
            viewport: {
              northeast: [res.geometry.viewport.northeast.lng, res.geometry.viewport.northeast.lat],
              southwest: [res.geometry.viewport.southwest.lng, res.geometry.viewport.southwest.lat],
            },
            name: res.name,
            googleMapsId: res.place_id,
            restrictMinors: false,
            address: res.vicinity,
            municipality: 'Fishers',
            state: 'Indiana',
            country: 'United States',
            initialLogo: res.icon || '',
            logo: res.icon || '',
            priceLevel: res.priceLevel || 0,
            campaigns: [{
              label: 'Initial Campaign',
              message: `${(Math.floor(Math.random() * 9) + 1) * 5}% off order`
            }]
          })])
        }
      }
      if(newVenues.length) {
        sidewalk.emphasize('CREATING SHADOW VENUES')
        const shadowVenues = await Venue.insertMany(newVenues)
        return shadowVenues.length
      } else {
        return 0
      }
    } else {
      return 0
    }
  })
  
  // async function(err, response): Promise<void> )
}
