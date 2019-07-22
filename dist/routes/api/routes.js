"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const api = express.Router();
const ping_1 = require("../../modules/ping");
api.get('/ping', ping_1.default);
exports.default = api;
//# sourceMappingURL=routes.js.map