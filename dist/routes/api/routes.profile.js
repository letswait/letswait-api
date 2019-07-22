"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
// import * as passport from 'passport'
const pass = require("../../pass");
const api = express.Router();
const post_change_profile_1 = require("../../modules/post-change-profile");
api.post('/post-change-profile', pass.ensureAuthenticated, post_change_profile_1.default);
exports.default = api;
//# sourceMappingURL=routes.profile.js.map