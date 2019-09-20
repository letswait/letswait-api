import { Match, User, Venue } from '../schemas'
import moment = require('moment')

import sidewalk from '../library/sidewalk'

import { IWheel } from '../types/index'
import { postLocation } from './post-chat';

export default function (req, res) {
  const { wheel, matchId }:
    { wheel: IWheel, matchId: string} = req.body
  console.log(req.body)
  if(!matchId) return res.status(500).send()
  const segment = wheel.segments[wheel.chosenSegment]
  if(!segment.campaignId || !segment.venueId) return res.status(500).send()
  // Verify Venue / Campaign exists
  console.log('finding venue')
  Venue.findOne({
    "_id": segment.venueId,
  }, (err, venue) => {
    if(err || !venue) return res.status(500).send()
    console.log('updating match?')
    Match.findOneAndUpdate(
      { _id: matchId },
      {
        $push: {
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
        console.log('got match?', er, match)
        if(er || !match) return res.status(500).send()
        const processedMatch = await postLocation(match._id, req.user._id, {
          text: '',
          location: venue.location,
          campaignId: segment.campaignId
        })
        console.log('processed match: ', processedMatch)
        if(processedMatch) return res.status(200).send({ match: processedMatch })
        res.status(500).send()
      }
    )
  })

}
