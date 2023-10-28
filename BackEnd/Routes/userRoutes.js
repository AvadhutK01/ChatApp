const express = require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
userRouter.post('/addUser', userController.RegisterUser);
userRouter.post('/verify-login', userController.verifyLogin);
module.exports = userRouter;