"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Setup Passport
const passport = require("passport");
const passport_facebook_1 = require("passport-facebook");
const passport_local_1 = require("passport-local");
const config_1 = require("./config");
const db = require("./schemas");
const util_1 = require("./library/util");
const crypto = require("crypto");
const moment = require("moment");
passport.serializeUser(function (user, done) {
    return done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    return db.User.findById(id, function (err, user) {
        if (err || !user)
            return done(err);
        return done(null, user);
    });
});
passport.use(new passport_facebook_1.Strategy({
    clientID: config_1.default.facebookId,
    clientSecret: config_1.default.facebookSecret,
    callbackURL: 'localhost:8080/api/user/auth-facebook/callback',
    profileFields: ['id', 'first_name', 'gender', 'age_range', 'birthday', 'significant_other'],
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, cb) => {
    // Check if there is a uuid supplied
    if (!req.headers.uuid)
        return cb('There was no uuid supplied');
    // check if is old enough to use the app
    if (profile.age_range && profile.age_range.min >= 18)
        cb('not old enough');
    // Find User
    db.User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err)
            return cb(err);
        const birth = profile.birthday.length === 8 ? profile.birthday : null;
        // Create user if none found
        if (!user)
            user = new db.User(Object.assign({ facebookId: profile.id }, (birth ? { birth } : null), (profile.first_name ? { first_name: profile.first_name } : null), (profile.significant_other ? { significantOther: profile.significantOther } : null), { profile: Object.assign({}, (profile.gender ? { gender: profile.gender } : null)), devices: new Map([
                    [req.headers.uuid, {
                            token: '',
                            os: req.headers.os,
                            accessToken,
                            refreshToken,
                            lastLogin: new Date()
                        }]
                ]), searchSettings: {}, actions: {} }));
        // Create new device if uuid is not found
        if (!user.devices[req.headers.uuid]) {
            user.devices.set(req.headers.uuid, {
                token: '',
                os: req.headers.os,
                accessToken,
                refreshToken,
                lastLogin: new Date(),
            });
        }
        else {
            user.devices.set(req.headers.uuid, {
                token: user.devices[req.headers.uuid].token,
                os: user.devices[req.headers.uuid].os,
                accessToken,
                refreshToken,
                lastLogin: new Date(),
            });
        }
        // Save and passed saved user
        user.save((err, savedUser) => {
            if (err)
                cb(err);
            return cb(null, savedUser);
        });
    });
    // If user is not found, create it. add user to req?
    // console.log(`Facebook Login: ${accessToken} ${refreshToken}`, profile, cb)
}));
passport.use(new passport_local_1.Strategy({
    usernameField: 'sms',
    passwordField: 'sms',
    session: true,
    passReqToCallback: true,
}, (req, username, password, done) => {
    if (!req.headers.uuid)
        return done('There was no uuid supplied');
    db.User.findOne({ sms: username }, (err, user) => {
        if (err)
            return done(err);
        // No User Found, create temporary one
        if (!user) {
            user = new db.User({
                sms: username,
                searchSettings: {},
                devices: new Map([
                    [req.headers.uuid, {
                            token: '',
                            os: req.headers.os,
                            accessToken: crypto.randomBytes(18).toString('hex'),
                            expiresOn: moment().add(2, 'hours').toDate(),
                            refreshToken: `${req.headers.uuid}.${crypto.randomBytes(40).toString('hex')}`,
                            activeCode: util_1.genRandomNumbers(),
                            codeValid: false,
                        }]
                ]),
                actions: {},
                profile: {},
            });
        }
        // check for device uuid, if none exists, create new one
        const device = user.devices.get(req.headers.uuid);
        if (!device) {
            user.devices.set(req.headers.uuid, {
                token: '',
                os: req.headers.os,
                accessToken: crypto.randomBytes(18).toString('hex'),
                expiresOn: moment().add(2, 'hours').toDate(),
                refreshToken: `${req.headers.uuid}.${crypto.randomBytes(40).toString('hex')}`,
                activeCode: util_1.genRandomNumbers(),
                codeValid: false,
            });
        }
        else { // Otherwise, edit the existing device
            user.devices.set(req.headers.uuid, {
                token: device.token,
                accessToken: crypto.randomBytes(18).toString('hex'),
                expiresOn: moment().add(2, 'hours').toDate(),
                refreshToken: `${req.headers.uuid}.${crypto.randomBytes(40).toString('hex')}`,
                os: device.os,
                activeCode: util_1.genRandomNumbers(),
                codeValid: false,
            });
        }
        console.log(user.devices);
        user.save((err, savedUser) => {
            if (err)
                done(err);
            return done(null, savedUser);
        });
    });
}));
function ensureTempAuth(req, res, next) {
    console.log('ensuring temp auth?');
    if (req.isAuthenticated()) {
        console.log('authenticated');
        next();
    }
    else {
        res.status(500).send();
        // res.status(500).redirect('/app')
    }
}
exports.ensureTempAuth = ensureTempAuth;
function ensureAuthenticated(req, res, next) {
    console.log('ensuring authenticated');
    console.log(req, req.passport, req._passport, req.user, req.isAuthenticated());
    if (req.isAuthenticated()) {
        if (req.user && req.user.sms) {
            const device = req.user.devices.get(req.headers.uuid);
            if (device) {
                // Check If Logged in previously
                if (device.codeValid) {
                    // Check if Auth Token valid
                    const expiresOn = moment(device.expiresOn);
                    const expired = expiresOn.isValid() ? expiresOn.isSameOrBefore(moment()) : true;
                    if (!expired) {
                        console.log('token good to go!');
                        return next();
                    }
                    else if (device.refreshToken) {
                        console.log('token expired');
                        if (req.headers.refreshToken) {
                            console.log('refreshing accessToken');
                            return next();
                        }
                        else {
                            console.log('sending a token error, should request refresh');
                            res.status(200).send({ accepted: false, requestRefreshToken: true });
                        }
                    }
                    else {
                        res.redirect('/');
                    }
                }
                else {
                    res.redirect('/');
                }
            }
            else {
                res.redirect('/');
            }
        }
        else {
            return next();
        }
    }
    else {
        console.log('not authenticated');
        res.redirect('/');
    }
}
exports.ensureAuthenticated = ensureAuthenticated;
//# sourceMappingURL=pass.js.map