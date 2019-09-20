import { Match, User, Venue } from '../schemas'
import moment = require('moment')

import sidewalk from '../library/sidewalk'

import { IWheel } from '../types/index'
import { postLocation } from './post-chat';

export default function (req, res) {
  const { wheel, message, matchId }:
    { wheel: IWheel, message: string | undefined, matchId: string} = req.body
  if(!matchId) res.status(500).send()
  const msg = message && message.length ? message : ''
  const segment = wheel.segments[wheel.chosenSegment]
  if(!segment.campaignId || !segment.venueId) res.status(500).send()
  // Verify Venue / Campaign exists
  Venue.findOne({
    "_id": segment.venueId,
  }, (err, venue) => {
    if(err || !venue) res.status(500).send()

    Match.findOneAndUpdate(
      { _id: matchId },
      {
        $addToSet: {
          dates: {
            venue: venue._id,
            logo: venue.logo,
            name: venue.name,
            location: venue.location,
            campaignId: segment.campaignId,
            expiresOn: moment().add(7, 'days').toDate(),
            code: segment.code,
            consumed: false,
          }
        }
      },
      {
        new: true,
      },
      async (er, match) => {
        if(er || !match) res.status(500).send()
        const processedMatch = await postLocation(match._id, req.user._id, {
          text: msg,
          location: venue.location,
          campaignId: segment.campaignId
        })
        if(processedMatch) res.status(200).send({ match: processedMatch })
        else res.status(500).send()
      }
    )
  })

}
