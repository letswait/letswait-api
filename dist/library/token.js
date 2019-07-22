// import * as crypto from 'crypto'
// import { User } from '../schemas'
// export function generateAuthToken(req, res, next) {
//   req.token = req.token || {}
//   req.token.accessToken = crypto.randomBytes(18).toString('hex');
// }
// export function generateRefreshToken(req, res, next) {
//   req.token.refreshToken = req.user.clientId.toString() + '.' + crypto.randomBytes(
//     40).toString('hex');
//     const target = {
//       [`devices.${req.headers.uuid}.codeValid`]: true,
//       [`devices.${req.headers.uuid}.lastLogin`]: new Date(),
//     }
//     User.findByIdAndUpdate(req.user._id, { $set: target }, (err, savedUser) => {
//       if(err) next
//     })
//     // User.findByIdAndUpdate(req.user._id, )
// }
// function generateAccessToken(req, res, next) {
//   req.token = req.token ||  {};
//   req.token.accessToken = jwt.sign({
//     id: req.user._id,
//     clientId: req.user.clientId
//   }, SECRET, {
//     expiresIn: TOKENTIME
//   });
//   next();
// }
// function generateRefrehToken(req, res, next) {
//   if (req.query.permanent === 'true') {
//     req.token.refreshToken = req.user.clientId.toString() + '.' + crypto.randomBytes(
//       40).toString('hex');
//     db.client.storeToken({
//       id: req.user.clientId,
//       refreshToken: req.token.refreshToken
//     }, next);
//   } else {
//     next();
//   }
// }
//# sourceMappingURL=token.js.map