import * as aws from 'aws-sdk'
import * as fileType from 'file-type'
import * as formidable from 'formidable'
import * as fs from 'fs'
import * as sharp from 'sharp'
import config from '../config'

const awsConfig = new aws.Config({
  accessKeyId: config.awsAccess,
  secretAccessKey: config.awsSecret,
  region: config.awsRegion,
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

const createForm = (
  req: any,
  res: any,
  uploadDirectory: string,
) => {
  console.log('start formdata', req, uploadDirectory)
  let fileCount: number = 0
  let locations: string[] = []
  const form = new formidable.IncomingForm()
  console.log('creating form')
  form.uploadDir = '/tmp'
  form.keepExtensions = true
  form.multiples = true
  form.on('aborted', () => console.log('aborted'))
  form.on('progress', (bytesRecieved, bytesExpected) => {
  })
  form.on('file', (name: string, file: formidable.File) => {
    fileCount++
    console.log(file)
    if(file.hasOwnProperty('path')) {
      console.log('Upload Module Data: ', file, name)
      fs.readFile(file.path, (err: NodeJS.ErrnoException, data: Buffer) => {
        const location = sharp(data)
        .toFormat('jpeg')
        .toBuffer()
        .then(async (data) => {
          console.log('uploading to s3 now')
          const newLocation = await uploadPhoto(data, file, uploadDirectory, res)
          locations = locations.concat([newLocation])
        })
      })
    } else {
      console.log('no files provided')
      res.status('500').send({ err: true, message: 'No files were provided' })
    }
  })
  form.on('end', () => {
    console.log('finished')
    const checkUploadEnd = setInterval(
      () => {
        if(locations.length === fileCount) {
          console.log(locations.length, fileCount)
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
    console.log('ended stream')
    if(err) res.end()
  })
}

const uploadPhoto = async (
  data: Buffer,
  uploaded: formidable.File,
  uploadDirectory: string,
  res: Response,
): Promise<string> => {
  const extension = '.jpg'
  console.log('ext ', extension)
  const url = `uploads/${uploadDirectory}/${new Random().rand64bit(64)}${extension}`
  console.log('url', url)
  const params = {
    Bucket: config.awsBucket,
    Key: url,
    Body: data,
    ContentEncoding: 'base64',
    // secretAccessKey: config.awsSecret,
    // accessKeyId: config.awsAccess,
    ACL: 'public-read',
  }
  return s3.upload(params).promise().then((data: aws.S3.ManagedUpload.SendData) => {
    return data.Location
  }).catch((err: Error) => {
    console.log('Could not upload photos', err)
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
