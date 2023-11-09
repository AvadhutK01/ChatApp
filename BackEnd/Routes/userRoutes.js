const express = require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
userRouter.post('/addUser', upload.single('avatar'), userController.RegisterUser);
userRouter.post('/verify-login', userController.verifyLogin);
module.exports = userRouter;