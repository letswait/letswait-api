"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws = require("aws-sdk");
const formidable = require("formidable");
const fs = require("fs");
const sharp = require("sharp");
const config_1 = require("../config");
const awsConfig = new aws.Config({
    accessKeyId: config_1.default.awsAccess,
    secretAccessKey: config_1.default.awsSecret,
    region: config_1.default.awsRegion,
    apiVersions: {
        s3: '2006-03-01',
    },
});
aws.config.update(awsConfig);
const s3 = new aws.S3(awsConfig);
exports.default = {
    profile: (req, res) => {
        createForm(req, res, 'profile');
    },
    chat: (req, res) => {
        createForm(req, res, 'chat');
    }
};
const createForm = (req, res, uploadDirectory) => {
    console.log('start formdata', req, uploadDirectory);
    let fileCount = 0;
    let locations = [];
    const form = new formidable.IncomingForm();
    console.log('creating form');
    form.uploadDir = '/tmp';
    form.keepExtensions = true;
    form.multiples = true;
    form.on('aborted', () => console.log('aborted'));
    form.on('progress', (bytesRecieved, bytesExpected) => {
    });
    form.on('file', (name, file) => {
        fileCount++;
        console.log(file);
        if (file.hasOwnProperty('path')) {
            console.log('Upload Module Data: ', file, name);
            fs.readFile(file.path, (err, data) => {
                const location = sharp(data)
                    .toFormat('jpeg')
                    .toBuffer()
                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                    console.log('uploading to s3 now');
                    const newLocation = yield uploadPhoto(data, file, uploadDirectory, res);
                    locations = locations.concat([newLocation]);
                }));
            });
        }
        else {
            console.log('no files provided');
            res.status('500').send({ err: true, message: 'No files were provided' });
        }
    });
    form.on('end', () => {
        console.log('finished');
        const checkUploadEnd = setInterval(() => {
            if (locations.length === fileCount) {
                console.log(locations.length, fileCount);
                clearInterval(checkUploadEnd);
                res.status(200).send({
                    success: true,
                    message: `uploaded file to ${locations}`,
                    urls: locations,
                });
            }
        }, 50);
    });
    form.parse(req, (err) => {
        console.log('ended stream');
        if (err)
            res.end();
    });
};
const uploadPhoto = (data, uploaded, uploadDirectory, res) => __awaiter(this, void 0, void 0, function* () {
    const extension = '.jpg';
    console.log('ext ', extension);
    const url = `uploads/${uploadDirectory}/${new Random().rand64bit(64)}${extension}`;
    console.log('url', url);
    const params = {
        Bucket: config_1.default.awsBucket,
        Key: url,
        Body: data,
        ContentEncoding: 'base64',
        // secretAccessKey: config.awsSecret,
        // accessKeyId: config.awsAccess,
        ACL: 'public-read',
    };
    return s3.upload(params).promise().then((data) => {
        return data.Location;
    }).catch((err) => {
        console.log('Could not upload photos', err);
        return '';
    });
});
/**
 * @class Random
 * @description - Helper to generate random strings
 */
class Random {
    constructor() {
        this._randomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min)) + min;
        };
        this._randomList = (list) => {
            return list[this._randomInt(0, list.length)];
        };
    }
    rand64bit(count = 6) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let returnValue = '';
        const charArr = chars.split('');
        for (let i = 0; i < count; i++) {
            returnValue += this._randomList(charArr);
        }
        return returnValue;
    }
}
//# sourceMappingURL=upload.js.map