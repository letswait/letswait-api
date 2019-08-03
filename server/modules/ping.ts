import { Request } from "express"
import sidewalk from 'library/sidewalk'

export default (req: Request, res: any) => {
  sidewalk.emphasize(`Pong! ${req.ip}`)
  res.status(200).send({ message: 'Pong! Ready for better dating!' })
}
