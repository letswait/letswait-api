import { User } from '../schemas'
import sidewalk from '../library/sidewalk'
import googleMapsClient, { coordinateDistance } from '../library/maps'

// User.updateMany({ _id: { $exists: true }}, {
//   lastLocation: {
//     type: 'Point',
//     coordinates: [-86.01784069077294,39.95818919700558]
//   },
//   matches: [],
// }, (err, raw) => {
//   console.log(err, raw)
// })

export default function(req, res) {
  User.updateOne(
    { _id: req.user._id },
    { lastLocation: {
      type: 'Point',
      coordinates: req.body
    }},
    (err, savedUser) => {
      if(err || !savedUser) res.end()
      // sidewalk.success('Updated User Location')
    }
  )
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

