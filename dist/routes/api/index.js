"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("./routes");
const routes_feed_1 = require("./routes.feed");
const routes_matches_1 = require("./routes.matches");
const routes_profile_1 = require("./routes.profile");
const routes_upload_1 = require("./routes.upload");
const routes_user_1 = require("./routes.user");
const routes_dates_1 = require("./routes.dates");
exports.default = {
    api: routes_1.default,
    match: routes_matches_1.default,
    profile: routes_profile_1.default,
    upload: routes_upload_1.default,
    feed: routes_feed_1.default,
    user: routes_user_1.default,
    date: routes_dates_1.default
};
//# sourceMappingURL=index.js.map