// tslint:disable:max-line-length
import chalk from 'chalk'

const AWS_SECRET = 'UY2jIZZLz1c+/CQSBNorRF7e9CQoC7uI7VbthGjb'
const AWS_ACCESS = 'AKIAU3GPYJZMZ6UQMR7E'
const AWS_REGION = 'us-east-1'

let AWS_BUCKET_NAME = ''
let CLOUDFRONT_URL = ''

const	TWILIO_SID      = 'ACd1dfe33afd86a225f16378ea0ca0807f'
const	TWILIO_AUTH     = '94ab3caf7c4fb2a7697696eed02e67d9'
const	TWILIO_NUMBERS  = [ '+12029152786' ]

const FB_ID = '331108297584040'
const FB_SECRET = '7c4b898fa9ffa12b1028816d5f1d036e'

let MONGO_URL = ''

const EMAIL_REGEX = new RegExp('/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/')
const PHONE_REGEX = new RegExp('/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/', 'im')
const ESCAPE_REGEX = (s: any) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

// if (process.env.NODE_ENV == "development") {
console.log(chalk.green('Development Environment Running!'))
MONGO_URL       = 'mongodb://admin:passw0rd@ds157735.mlab.com:57735/letswait-development'
AWS_BUCKET_NAME = 'letswait-development'
CLOUDFRONT_URL  = 'https://d1859sbnlrif6h.cloudfront.net'

/*}
else {
  console.log(chalk.green('Production Environment Running!'))
  MONGO_URL       = 'mongodb://admin:password@ds157735.mlab.com:57735/letswait-production'
  AWS_BUCKET_NAME = 'letswait-production'
  //TWILIO_SID      = "ACa9562c179b4a5590afadc04d15e9a722"
  //TWILIO_AUTH     = "1aaa050cb57231403b1337787a1330a2"
  //TWILIO_NUMBERS  = [ '+16194863306' ]
}*/
export default {
  mongo: MONGO_URL,
  awsSecret: AWS_SECRET,
  awsAccess: AWS_ACCESS,
  awsBucket: AWS_BUCKET_NAME,
  twilioSID: TWILIO_SID,
  twilioAuth: TWILIO_AUTH,
  twilioNumbers: TWILIO_NUMBERS,
  emailRegex: EMAIL_REGEX,
  phoneRegex: PHONE_REGEX,
  escapeRegex: ESCAPE_REGEX,
  awsRegion: AWS_REGION,
  cloudfrontUrl: CLOUDFRONT_URL,
  facebookId: FB_ID,
  facebookSecret: FB_SECRET,
  apnAuthKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgzWr8gngZ1C8B+s7S\nfIpKV41DmYrCZI94Lq5Ltdpsfw+gCgYIKoZIzj0DAQehRANCAATuV7qV+fqbR9PE\neMBD0Lm4z9o1AXGAix9ExnpsY9Gn04Up3ZEOXkjAseIggv+iwWdw5bfSvzlwRnf8\nMkomCRYu\n-----END PRIVATE KEY-----',
}
