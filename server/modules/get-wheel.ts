import { Venue, Match, User } from '../schemas'
import { IVenueModel } from '../schemas/venue'
import { IMatchModel } from '../schemas/match'
import { coordinateMidpoint } from '../library/maps'
import { IWheel, IWheelSegment } from '../types/';

import discoverVenues from '../library/discoverVenues'

export default async function (req, res) {
  Match.findOne({ '_id': req.query.matchId }, async (err, match) => {
    if (err || !match) res.status(500).send()
    const wheel = await createWheel(match)
    if (wheel) {
      res.status(200).send(wheel)
    } else {
      res.status(500).send()
    }
  })
}

// I dont know if this works yet, caution should be taken when using it.
// its fairly complex and will grow in complexity as more filters are added
export async function createWheel(match: any) {
  let query: any = {
    'campaigns.0': { $exists: true },
    location: undefined
  }
  const users = await User.find(
    { '_id': { $in: [match.userProfiles[0]._id, match.userProfiles[1]._id] } },
  )
  let wheel: IWheel
  if (users && users.length) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [
            users[0].lastLocation.coordinates[0],
            users[0].lastLocation.coordinates[1]],
        },
        $maxDistance: 500000,
      }
    }
    if (Math.min(users[0].age, users[1].age) < 21) {
      query.restrictMinors = false
    }
    const venues = await Venue.find(query)
    const count = venues.length
    let venueCount = count
    if (venueCount < 12) {
      const val = await discoverVenues([users[0].lastLocation[1], users[0].lastLocation[0]])
      venueCount = venueCount + val
    }
    let foundSegments = 0
    const chosenSegment = Math.min(Math.floor(Math.random() * 12), 7)
    let segments = new Array(12).fill(undefined)
    for (let i = segments.length; i--;) {
      const venue = await Venue.findOne(query)
        .skip(Math.floor(Math.random() * 20))
      if (venue) {
        foundSegments++
        const foodCats = ['AMERICAN','SUSHI','MUSIC','CHINESE','JAPANESE','PIZZA','COFFEE','MEXICAN','MOVIES','OUTDOOR','ITALIAN','COMEDY']
        segments[i] = {
          logo: venue.logo,
          label: foodCats[i],
          ...(i === chosenSegment ? { venueId: (venue as any)._id } : null),
          ...(i === chosenSegment ? { campaignId: (venue as any).campaigns[0]._id } : null),
          ...(i === chosenSegment ? { priceLevel: venue.priceLevel } : null),
          ...(i === chosenSegment ? { message: venue.campaigns[0].message } : null),
          ...(i === chosenSegment ? {
            code: (() => {
              // This generates a code following the venue's generated validation rules
              const { sum, indexPair } = venue.codeValidationSecret
              const firstIndexPairValue = Math.floor(Math.min(Math.random() * Math.min(10, venue.codeValidationSecret.sum), 9))
              return new Array(6).fill(0).map((num, i, arr) => {
                if (i === indexPair) {
                  return firstIndexPairValue
                }
                if (i - 3 === indexPair) {
                  return sum - firstIndexPairValue
                }
                return Math.floor(Math.min(Math.random() * 10, 9))
              }).join('')
            })(),
          } : null),
        }
      }
    }
    if (foundSegments === 12) {
      // Successfully created segments, send back
      wheel = {
        segments,
        chosenSegment,
      }
    }
    // Venue.count(query).exec(async (err, count) => )
    if (wheel) {
      return wheel

    }
  } else {
    return null
  }
}