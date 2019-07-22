"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("../schemas");
function default_1(req, res) {
    console.log('finding user, ', req.user_id);
    schemas_1.User.findById(req.user._id, (err, user) => {
        if (err || !user)
            res.status(500).send({ accepted: false });
        console.log('found user', user);
        if (user.registered) {
            console.log('user already registered, sharing user profile');
            delete user.devices;
            res.status(200).send({ accepted: true, user: user });
        }
        else {
            console.log('sending to remaining setup Routes');
            res.status(200).send({ accepted: true, remainingSetupRoutes: [
                    ...(user.birth ? [] : ['/setup/birthdate']),
                    ...(user.name ? [] : ['/setup/name']),
                    ...(user.profile && user.profile.gender ? [] : ['/setup/gender']),
                    ...(user.searchSettings && user.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
                    ...(user.profile && user.profile.images.length ? [] : ['/setup/photo-upload']),
                    ...(user.profile && user.profile.food.length ? [] : ['/setup/food-interests']),
                    ...(user.profile && user.profile.goal ? [] : ['/setup/goals']),
                ] });
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=check-auth.js.map