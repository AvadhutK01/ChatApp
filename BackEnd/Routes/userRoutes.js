const express = require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
userRouter.get('/getReg', userController.getRegistrationPage);
userRouter.get('/getLog', userController.getLoginPage);
userRouter.post('/addUser', userController.RegisterUser);
module.exports = userRouter;