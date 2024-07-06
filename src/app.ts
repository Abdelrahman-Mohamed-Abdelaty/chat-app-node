import helmet from "helmet";
import express, {query} from 'express'
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import rateLimit from "express-rate-limit";
import {users} from './utils/users'
// @ts-ignore
import xss from "xss-clean";
import mongoSantize from "express-mongo-sanitize";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";
import compression from 'compression';
import cors from 'cors';
import path from 'path'

const app=express();
app.set('view engine','pug');
app.set('views',path.join(__dirname,'./views'));
//middlewares
app.enable('trust proxy');

//Implement CORS
app.use(cors());
//here we apply preflight request
app.options('*',cors());
app.use(express.static(path.join(__dirname, 'public')));
//Set security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
                baseUri: ["'self'"],
                fontSrc: ["'self'", 'https:', 'data:'],
                scriptSrc: [
                    "'self'",
                    'https:',
                    'http:',
                    'blob:',
                    'https://*.mapbox.com',
                    'https://js.stripe.com',
                    'https://*.cloudflare.com',
                ],
                frameSrc: ["'self'", 'https://js.stripe.com'],
                objectSrc: ['none'],
                styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                workerSrc: ["'self'", 'data:', 'blob:'],
                childSrc: ["'self'", 'blob:'],
                imgSrc: ["'self'", 'data:', 'blob:'],
                connectSrc: [
                    "'self'",
                    'blob:',
                    'wss:',
                    'https://*.tiles.mapbox.com',
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                ],
                upgradeInsecureRequests: [],
            },
        },
    })
);

const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Tour many requests from this IP,please try in an hour'
})
//Data sanitization against NoSQL injection
app.use(mongoSantize())
app.use(compression());//for text send in responses
//Data sanitize against from xss
app.use(xss());
app.use('/api',limiter);

app.use(cookieParser())
app.use(express.json({limit:'10kb'}));// 10 kilo byte as max for denial attacks
app.use(express.urlencoded({extended:true,limit:'10kb'}));// for sending requests from forms
if(process.env.NODE_ENV==="development"){
    app.use(morgan("dev"));
}


//routes
app.get('/api',(req,res,next)=>{
    res.status(200).json(users.getAllRooms());
})


app.all("*",(req,res,next)=>{
    const err=new AppError(`Can't find ${req.originalUrl} on this server`,404);
    next(err);
});

app.use(globalErrorHandler);
export default app
