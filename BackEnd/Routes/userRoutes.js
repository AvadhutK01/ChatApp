const express = require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
userRouter.post('/addUser', userController.RegisterUser);
module.exports = userRouter;