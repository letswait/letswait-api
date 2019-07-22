"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const passport = require("passport");
var pass = require('../../pass');
const api = express.Router();
const options = { session: true };
const sms_1 = require("../../modules/sms");
api.post('/auth', passport.authenticate('local', options), sms_1.default.send);
api.post('/code', pass.ensureTempAuth, sms_1.default.receive);
api.get('/facebook-auth', passport.authenticate('facebook', options));
api.get('/facebook-auth/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function (req, res) {
    if (!!req.user.registered) {
        res.redirect('/app');
    }
    else {
        res.json({
            gender: !!req.user.profile.gender,
            sexualPreference: !!req.user.searchSettings.sexualPreference,
            photos: req.user.profile.images.length > 0,
            food: req.user.profile.food > 0,
            name: !!req.user.name,
            birth: !!req.user.birth,
            goal: !!req.user.profile.goal,
        }).send();
    }
});
/**
 * @todo restrict parameters sent down to user.
 */
const check_auth_1 = require("../../modules/check-auth");
api.get('/check-auth', pass.ensureAuthenticated, check_auth_1.default);
const refreshToken_1 = require("../../modules/refreshToken");
api.get('/check-auth/error', pass.ensureAuthenticated, refreshToken_1.default);
api.get('/logout', pass.ensureAuthenticated, (req, res) => {
    req.logout();
});
const user_post_sns_token_1 = require("../../modules/user-post-sns-token");
api.get('/post-sns-token', pass.ensureAuthenticated, user_post_sns_token_1.default);
exports.default = api;
//# sourceMappingURL=routes.user.js.map