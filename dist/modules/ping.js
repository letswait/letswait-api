"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res) => {
    console.log(`Pong! ${req.ip}`);
    res.status(200).send({ message: 'Pong! Ready for better dating!' });
};
//# sourceMappingURL=ping.js.map