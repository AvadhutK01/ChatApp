const express = require('express');
const chatRouter = express.Router();
const chatController = require('../Controllers/chatController');
chatRouter.get('/Main', chatController.getMain);
module.exports = chatRouter;