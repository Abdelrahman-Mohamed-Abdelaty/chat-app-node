"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessage = void 0;
const generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: Date.now()
    };
};
exports.generateMessage = generateMessage;
