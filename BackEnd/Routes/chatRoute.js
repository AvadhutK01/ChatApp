const express = require('express');
const chatRouter = express.Router();
const chatController = require('../Controllers/chatController');
const authnticateUser = require('../MiddleWares/auth');
chatRouter.get('/Main', chatController.getMain);
chatRouter.get('/getChatList', authnticateUser, chatController.getChatList);
chatRouter.post('/add-contact', authnticateUser, chatController.addContact);
chatRouter.post('/add-message', authnticateUser, chatController.addMessage);
chatRouter.post('/get-chat', authnticateUser, chatController.getChat);
module.exports = chatRouter;