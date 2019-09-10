import { Venue } from '../schemas'
import googleMapsClient from './maps'
import { IVenueModel } from '../schemas/venue'
import sidewalk from './sidewalk'

export default async function discoverVenues(location: number[], radius?: number): Promise<number> {
  // sidewalk.warning('Generating Shadow Venues')
  let continueSearch = true
  let nextPageToken = ''

  let discoveredVenues: any[] = await googleMapsClient.placesNearby({
    location,
    radius: radius || 50000,
    type: 'restaurant',
  }).asPromise()
  .then((response: any) => returnResults(response))
  .catch((err: any) => console.log('There was an error: ', err))

  function returnResults(response) {
    if(response && response.json) {
      const { next_page_token, results } = response.json
      if(next_page_token) {
        nextPageToken = next_page_token
      } else {
        continueSearch = false
        nextPageToken = ''
      }
      return results || []
    }
  }

  while(continueSearch) {
    const newAdditions = await googleMapsClient.placesNearby({
      pagetoken: nextPageToken
    }).asPromise()
      .then((response) => returnResults(response))
      .catch(err => console.log('There was an error: ', err))
    discoveredVenues = discoveredVenues.concat(newAdditions)
      
  }
  
  discoveredVenues = discoveredVenues.filter(value => value)
  
  /**
   * @async
   * @name Venue.UpsertMany - Quickly and efficiently updates and upserts discovered venues.
   * --------------------------------------------------------------------------------------------
   * @description This code block takes the resulting array of discovered venues, updates/upserts
   *              documents as neeeded, in a data protective way ($setOnInsert). Looks scary but
   *              should be easy to understand after a second. the IIFE is just for berevity.
   *               - hint: mongoose.model.query.exec() returns a full promise.
   * --------------------------------------------------------------------------------------------
   * @todo Add Optional Spinner Filter. if we can immediately send the spinner upon finding first
   *       8 Venues that match the intended query, we can make venue discover much much faster.
   * --------------------------------------------------------------------------------------------
   * @todo Add Check for Claimed Venues, claimed venues can be managed manually if that field was
   *       physically changed before, This "Extended Release" of responsibilities allow managers
   *       to tailor to what degree they manage their LetsWait accounts without punishing venues
   *       that dont devote as much time to manage their account.
   */
  const results = discoveredVenues
  const foundVenues = await Promise.all<IVenueModel>(
    results.map((res, i, arr) => (async () => {
      const VenuePromise = Venue.findOneAndUpdate(
        { googleMapsId: results[i].place_id },
        {
          $setOnInsert: {
            location: {
              type: 'Point',
              coordinates: [res.geometry.location.lng, res.geometry.location.lat],
            },
            viewport: {
              northeast: {
                type: 'Point',
                coordinates: [res.geometry.viewport.northeast.lng, res.geometry.viewport.northeast.lat],
              },
              southwest: {
                type: 'Point',
                coordinates: [res.geometry.viewport.southwest.lng, res.geometry.viewport.southwest.lat],
              },
            },
            name: res.name,
            googleMapsId: res.place_id,
            restrictMinors: false,
            address: res.vicinity,
            initialLogo: res.icon || '',
            municipality: 'Fishers',
            state: 'Indiana',
            country: 'United States',
            campaigns: [{
              priceLevel: res.priceLevel || 0,
              label: 'Initial Campaign',
              message: `${(Math.floor(Math.random() * 4) + 1) * 5} off order`
            }]
          },
          $set: {
            logo: res.icon || '',
            lastSurveyed: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      ).exec()
      return await VenuePromise.then(doc => doc)
    })())
  )
  const newVenues = foundVenues.filter((venue, i, arr) => {
    return venue.isNew
  })
  /**
   * @todo Add newVenue map to get venueId[] to save to the "Discovered Venues" action.
   */
  const newVenueCount = newVenues.length
  // sidewalk.emphasize(`${newVenueCount} venues discovered`)
  return newVenueCount
}
