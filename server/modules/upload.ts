import * as aws from 'aws-sdk'
import * as fileType from 'file-type'
import * as formidable from 'formidable'
import * as fs from 'fs'
import * as sharp from 'sharp'

const awsConfig = new aws.Config({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION,
  apiVersions: {
    s3: '2006-03-01',
  },
})
aws.config.update(awsConfig)
const s3 = new aws.S3(awsConfig)

export default {
  profile: (req, res) => {
    createForm(req, res, 'profile')
  },
  chat: (req, res) => {
    createForm(req, res, 'chat')
  }
}

const createExtension = (type: 'image/heic' | 'image/jpeg')  => {
  switch(type) {
    case 'image/heic': return '.heic'
    case 'image/jpeg': return '.jpg'
    default: return '.png'
  }
}

const createForm = (
  req: any,
  res: any,
  uploadDirectory: string,
) => {
  let fileCount: number = 0
  let locations: string[] = []
  const form = new formidable.IncomingForm()
  form.uploadDir = '/tmp'
  form.keepExtensions = true
  form.multiples = true
  form.on('aborted', () => console.log('aborted'))
  form.on('progress', (bytesRecieved, bytesExpected) => {
  })
  form.on('file', (name: string, file: formidable.File) => {
    fileCount++
    if(file.hasOwnProperty('path')) {
      fs.readFile(`${file.path}`, (err: NodeJS.ErrnoException, data: Buffer) => {
        const location = sharp(data)
        .jpeg({
          quality: 100,
          chromaSubsampling: '4:4:4'
        })
        .toBuffer()
        .then(async (data) => {
          const newLocation = await uploadPhoto(data, file, uploadDirectory, res, file.type as any)
          locations = locations.concat([newLocation])
        })
      })
    } else {
      res.status('500').send({ err: true, message: 'No files were provided' })
    }
  })
  form.on('end', () => {
    const checkUploadEnd = setInterval(
      () => {
        if(locations.length === fileCount) {
          clearInterval(checkUploadEnd)
          res.status(200).send({
            success: true,
            message: `uploaded file to ${locations}`,
            urls: locations,
          })
        }
      },
      50,
    )
  })
  form.parse(req, (err) => {
    if(err) res.end()
  })
}

const uploadPhoto = async (
  data: Buffer,
  uploaded: formidable.File,
  uploadDirectory: string,
  res: Response,
  type: 'image/heic' | 'image/jpeg'
): Promise<string> => {
  let extension: '.jpg' | '.png' | '.heic' = createExtension(type)
  const url = `uploads/${uploadDirectory}/${new Random().rand64bit(64)}${extension}`
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: url,
    Body: data,
    ContentEncoding: 'base64',
    ACL: 'public-read',
  }
  return s3.upload(params).promise().then((data: aws.S3.ManagedUpload.SendData) => {
    return data.Location
  }).catch((err: Error) => {
    return ''
  })
}

/**
 * @class Random
 * @description - Helper to generate random strings
 */
class Random {
  _randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min
  };
  _randomList = (list: string[]) => {
    return list[this._randomInt(0, list.length)]
  };

  rand64bit(count: number = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let returnValue = ''
    const charArr = chars.split('')
    for(let i = 0; i < count; i++) {
      returnValue += this._randomList(charArr)
    }
    return returnValue
  }
}
