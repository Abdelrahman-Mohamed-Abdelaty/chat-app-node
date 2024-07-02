"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRealString = void 0;
const isRealString = (str) => {
    return typeof str === "string" && str.trim().length > 0;
};
exports.isRealString = isRealString;
