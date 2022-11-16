import express from 'express';
import { loggerInUser, login, register, activateAccount } from '../controllers/userControllers.js';

// init Route
const Router = express.Router();


// user auth route
Router.post('/login', login);
Router.post('/register', register);
Router.get('/me', loggerInUser);
Router.get('/activate/:token', activateAccount);



// export Default Router
export default Router;