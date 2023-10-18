const express = require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
userRouter.get('/getReg', userController.getRegistrationPage);
userRouter.get('/getLog', userController.getLoginPage);
userRouter.post('/addUser', userController.RegisterUser);
userRouter.post('/verify-login', userController.verifyLogin);
module.exports = userRouter;