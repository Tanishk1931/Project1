

import express from 'express';
import userRouter from './routes/user.router.js';  
import cors from 'cors';
import cookieParser from 'cookie-parser';
 

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN, // replace with your client's origin
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use( express.static('public'));


app.use('/api/v1/users', userRouter);




export default app; 