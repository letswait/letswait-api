import { User } from '../schemas'
import sidewalk from '../library/sidewalk'
import googleMapsClient, { coordinateDistance } from '../library/maps'

export default function(req, res) {
  sidewalk.warning(`Updating Geolocation`)
  User.updateOne({ _id: req.user._id }, { lastLocation: req.body }, (err, savedUser) => {
    if(err || !savedUser) res.end()
    sidewalk.success('Updated User Location')
  })
  if(!req.user.lastLocation) res.end()
  // const distanceTravelled = coordinateDistance(req.user.lastLocation, req.body)
  // if(distanceTravelled >= 100) {
  //   // Find Place Data
  //   googleMapsClient.placesNearby({
  //     language: 'en',
  //     location: req.body,
  //     minPrice: 1,
  //     maxPrice: 4,
  //     type: 'restaurant',
  //     radius: 100,
  //   }).asPromise().then((response) => {
  //     if(response.status !== 200) return
  //     const results = response.json.results
  //     for(let i = results.length; i--;) {
        
  //     }
  //   })
  // }
  res.end()
}

