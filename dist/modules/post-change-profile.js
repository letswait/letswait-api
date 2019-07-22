"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("../schemas");
function default_1(req, res) {
    console.log('asked to change user profile');
    schemas_1.User.findById(req.user._id, (err, user) => {
        if (err || !user)
            res.status(500).send();
        console.log('found user', user);
        const changes = req.body;
        console.log('here are the changes: ', req.body, changes);
        user.profile.gender = changes.gender || user.profile.gender;
        user.searchSettings.sexualPreference = (() => {
            if (changes.sexualPreference) {
                const pref = changes.sexualPreference.toLowerCase();
                if (pref === 'male' || pref === 'men') {
                    return 'male';
                }
                if (pref === 'female' || pref === 'women') {
                    return 'female';
                }
                return 'everyone';
            }
            return user.searchSettings.sexualPreference;
        })() || user.searchSettings.sexualPreference;
        user.profile.images = changes.photos || user.profile.images;
        user.profile.food = changes.food || user.profile.food;
        user.name = changes.name || user.name;
        user.birth = changes.birth || user.birth;
        user.profile.goal = changes.goal || user.profile.goal;
        if (user.profile && user.searchSettings &&
            user.profile.gender &&
            user.searchSettings.sexualPreference &&
            user.profile.images &&
            user.profile.images.length >= 3 &&
            user.profile.food &&
            user.profile.food.length > 1 &&
            user.name &&
            user.birth &&
            user.profile.goal) {
            user.registered = new Date();
        }
        console.log('saving user: ', user);
        user.updateOne(user, (err, savedUser) => {
            if (err || !savedUser) {
                console.log('could not save user');
                res.status(500).send();
            }
            else {
                console.log('savedUser: ', savedUser);
                res.status(200).send({ accepted: true });
            }
        });
        // user.save((err, savedUser) => {
        //   if(err || !savedUser) res.status(500).send()
        //   res.status(200).send({ accepted: true })
        // })
    });
}
exports.default = default_1;
//# sourceMappingURL=post-change-profile.js.map