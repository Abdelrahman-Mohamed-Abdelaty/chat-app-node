import path from "path";
import * as http from "http";

// @ts-ignore
import socketIO from 'socket.io'
process.on('uncaughtException',err=>{
    console.log("ERROR 🔥: ",err)
    process.exit(1);
});
import app from './app';
import mongoose from "mongoose";
import dotenv from "dotenv";
import {generateMessage, generateLocationMessage, generateData} from "./utils/message.js";
import {isRealString} from "./utils/validation";
import {Users} from "./utils/users";

dotenv.config({path:path.join(__dirname,'./config.env')})
const PORT=process.env.PORT||3000;
const server=http.createServer(app);
const io = socketIO(server);

const users=new Users();
io.on('connection',(socket:any)=>{
    console.log("new user connected");

    socket.on('join',(params:any,cb:any)=>{
        if(!isRealString(params.name)|| !isRealString(params.room)){
            return cb('Name and room are required')
        }
        params.room=params.room.toLowerCase();
        params.name=params.name.toLowerCase();
        const roomUsersWithSameName=users.getUserList(params.room).filter((user)=> user===params.name);
        if(roomUsersWithSameName.length>0){
            return cb('This name is used in this room. Please use another one');
        }

        //socket.emit() for one socket this soceket only --->same
        //io.emmit() for any one connected to the server-->io.to(roomName).emmit()
        //socket.broadcast.emit for all except me-->socket.broadcast.to(roomName).emit()
        socket.join(params.room);
        //socket.leave(name of the room);
        users.removeUser(socket.id);
        users.addUser(socket.id,params.name,params.room);
        io.to(params.room).emit('updateUserList',users.getUserList(params.room));

        socket.emit('newMessage',generateMessage("Admin","welcome to our chat app"));
        socket.broadcast.to(params.room).emit('newMessage',generateMessage("Admin",`${params.name} has joined`));
        cb();
    })
    socket.on('createMessage',(msg:any,cb:any)=>{
        const user=users.getUser(socket.id);
        if(user&&isRealString(msg.text)){
            io.to(user.room).emit('newMessage',generateMessage(user.name,msg.text));
        }

        cb();//what you pass here send it the function in the emit
    })

    socket.on('createLocationMessage',(coords:any)=>{
        const user=users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude, coords.longitude));
        }
    })
    const handleData=(msg:any,event:string)=>{
        const user=users.getUser(socket.id);
        if(user){
            io.to(user.room).emit(event,generateData(user.name,msg.data));
        }
    }
    socket.on('createPhotoMessage',(msg:string)=>{
        handleData(msg,'newPhotoMessage');
    })
    socket.on('createAudioMessage',(msg:string)=>{
        handleData(msg,'newAudioMessage');
    });

    socket.on('disconnect',()=>{
        const user=users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList',users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has leaved the room`));
        }
    })

})
server.listen(PORT, ()=>{
    console.log(`the server is running at ${process.env.PORT}`);
    // mongoose.connect(process.env.CONNECTION_STRING!, {
    //     useCreateIndex: true,
    //     useNewUrlParser: true,
    //     useFindAndModify: false
    //
    // }).then(r =>console.log("connected successfully to database"))
});
process.on('unhandledRejection',(err:{name:string ,message:string})=>{
        console.log("ERROR 🔥: ",err.name,err.message)
        console.log("Shutting down ...");
        // process.exit(1);//will abort all running reqeusts
        server.close(()=>{
            process.exit(1);
        })
    }
);
