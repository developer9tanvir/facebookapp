import express from 'express';
import colors from 'colors';
import userRoute from './routes/user.js';
import dotenv from 'dotenv';
import mongoDBConnect from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';


const app = express();
dotenv.config()

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(cookieParser());





// init env variabels
const PORT = process.env.PORT || 8080;




// api Routes
app.use('/api/v1/user', userRoute);



// express error handler 
app.use( errorHandler );




// listen servsr
app.listen(PORT, () =>{
    mongoDBConnect();
    console.log(`Server running on port ${ PORT }`.bgGreen.black);
});


