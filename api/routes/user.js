import express from 'express';
import { loggerInUser, login, register, activateAccount, activateAccountByCode, forgotPassword, passwordResetAction } from '../controllers/userControllers.js';

// init Route
const Router = express.Router();


// user auth route
Router.post('/login', login);
Router.post('/register', register);
Router.get('/me', loggerInUser);
Router.get('/activate/:token', activateAccount);
Router.post('/code-activate/', activateAccountByCode);
Router.post('/forgot-password/', forgotPassword);
Router.post('/forgot-password/:token', passwordResetAction);



// export Default Router
export default Router;