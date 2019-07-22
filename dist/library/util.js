"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @function genRandomNumbers
 * @description - Generates random string of numbers
 * @param n - digits in output string
 */
exports.genRandomNumbers = (n = 4) => {
    const numArr = new Array(n).fill(0).map(() => Math.floor(Math.random() * 10));
    return numArr.join('');
};
//# sourceMappingURL=util.js.map