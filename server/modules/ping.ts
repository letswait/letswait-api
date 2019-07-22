import { Request } from "express"

export default (req: Request, res: any) => {
  console.log(`Pong! ${req.ip}`)
  res.status(200).send({ message: 'Pong! Ready for better dating!' })
}
