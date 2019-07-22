"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const pass = require("../../pass");
const api = express.Router();
const upload_1 = require("../../modules/upload");
api.post('/image/profile', pass.ensureAuthenticated, upload_1.default.profile);
api.post('/image/chat', pass.ensureAuthenticated, upload_1.default.chat);
exports.default = api;
//# sourceMappingURL=routes.upload.js.map