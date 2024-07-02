"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateData = exports.generateLocationMessage = exports.generateMessage = void 0;
const moment_1 = __importDefault(require("moment"));
const generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: (0, moment_1.default)().valueOf()
    };
};
exports.generateMessage = generateMessage;
const generateLocationMessage = (from, lat, long) => {
    return {
        from,
        url: `https://www.google.com/maps/?q=${lat},${long}`,
        createdAt: (0, moment_1.default)().valueOf()
    };
};
exports.generateLocationMessage = generateLocationMessage;
const generateData = (from, data) => {
    return {
        from,
        url: data,
        createdAt: (0, moment_1.default)().valueOf()
    };
};
exports.generateData = generateData;
