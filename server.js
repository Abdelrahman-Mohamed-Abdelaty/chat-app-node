"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const http = __importStar(require("http"));
// @ts-ignore
const socket_io_1 = __importDefault(require("socket.io"));
process.on('uncaughtException', err => {
    console.log("ERROR 🔥: ", err);
    process.exit(1);
});
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const message_js_1 = require("./utils/message.js");
const validation_1 = require("./utils/validation");
const users_1 = require("./utils/users");
dotenv_1.default.config({ path: path_1.default.join(__dirname, './config.env') });
const PORT = process.env.PORT || 3000;
const server = http.createServer(app_1.default);
const io = (0, socket_io_1.default)(server);
io.on('connection', (socket) => {
    console.log("new user connected");
    socket.on('join', (params, cb) => {
        if (!(0, validation_1.isRealString)(params.name) || !(0, validation_1.isRealString)(params.room)) {
            return cb('Name and room are required');
        }
        params.room = params.room.toLowerCase();
        params.name = params.name.toLowerCase();
        const roomUsersWithSameName = users_1.users.getUserList(params.room).filter((user) => user === params.name);
        if (roomUsersWithSameName.length > 0) {
            return cb('This name is used in this room. Please use another one');
        }
        //socket.emit() for one socket this soceket only --->same
        //io.emmit() for any one connected to the server-->io.to(roomName).emmit()
        //socket.broadcast.emit for all except me-->socket.broadcast.to(roomName).emit()
        socket.join(params.room);
        //socket.leave(name of the room);
        users_1.users.removeUser(socket.id);
        users_1.users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users_1.users.getUserList(params.room));
        socket.emit('newMessage', (0, message_js_1.generateMessage)("Admin", "welcome to our chat app"));
        socket.broadcast.to(params.room).emit('newMessage', (0, message_js_1.generateMessage)("Admin", `${params.name} has joined`));
        cb();
    });
    socket.on('createMessage', (msg, cb) => {
        const user = users_1.users.getUser(socket.id);
        if (user && (0, validation_1.isRealString)(msg.text)) {
            io.to(user.room).emit('newMessage', (0, message_js_1.generateMessage)(user.name, msg.text));
        }
        cb(); //what you pass here send it the function in the emit
    });
    socket.on('createLocationMessage', (coords) => {
        const user = users_1.users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newLocationMessage', (0, message_js_1.generateLocationMessage)(user.name, coords.latitude, coords.longitude));
        }
    });
    const handleData = (msg, event) => {
        const user = users_1.users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit(event, (0, message_js_1.generateData)(user.name, msg.data));
        }
    };
    socket.on('createPhotoMessage', (msg) => {
        handleData(msg, 'newPhotoMessage');
    });
    socket.on('createAudioMessage', (msg) => {
        handleData(msg, 'newAudioMessage');
    });
    socket.on('disconnect', () => {
        const user = users_1.users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users_1.users.getUserList(user.room));
            io.to(user.room).emit('newMessage', (0, message_js_1.generateMessage)('Admin', `${user.name} has leaved the room`));
        }
    });
});
server.listen(PORT, () => {
    console.log(`the server is running at ${process.env.PORT}`);
    // mongoose.connect(process.env.CONNECTION_STRING!, {
    //     useCreateIndex: true,
    //     useNewUrlParser: true,
    //     useFindAndModify: false
    //
    // }).then(r =>console.log("connected successfully to database"))
});
process.on('unhandledRejection', (err) => {
    console.log("ERROR 🔥: ", err.name, err.message);
    console.log("Shutting down ...");
    // process.exit(1);//will abort all running reqeusts
    server.close(() => {
        process.exit(1);
    });
});
