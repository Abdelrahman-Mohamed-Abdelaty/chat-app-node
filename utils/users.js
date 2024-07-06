"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
class Users {
    constructor() {
        this.users = [];
    }
    addUser(id, name, room) {
        const user = { id, name, room };
        this.users.push(user);
        return user;
    }
    getUserList(room) {
        return this.users
            .filter((user) => user.room === room)
            .map((user) => user.name);
    }
    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }
    removeUser(id) {
        const user = this.getUser(id);
        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }
    getAllRooms() {
        const rooms = [];
        this.users.forEach((user) => {
            if (!rooms.includes(user.room)) {
                rooms.push(user.room);
            }
        });
        return rooms;
    }
}
exports.users = new Users();
