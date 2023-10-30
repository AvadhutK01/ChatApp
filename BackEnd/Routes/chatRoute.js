const express = require('express');
const chatRouter = express.Router();
const chatController = require('../Controllers/chatController');
const authnticateUser = require('../MiddleWares/auth');
chatRouter.get('/getChatList', authnticateUser, chatController.getChatList);
chatRouter.post('/add-contact', authnticateUser, chatController.addContact);
chatRouter.post('/add-group', authnticateUser, chatController.addGroup);
chatRouter.post('/add-message', authnticateUser, chatController.addMessage);
chatRouter.post('/add-messagetoGroup', authnticateUser, chatController.addMessageToGroup);
chatRouter.post('/get-chat', authnticateUser, chatController.getChat);
chatRouter.post('/get-latestchat', authnticateUser, chatController.getLatestChat);
chatRouter.post('/getMembersList', authnticateUser, chatController.getMembersList);
chatRouter.post('/actionOnGroup', authnticateUser, chatController.performActionToGroup);
chatRouter.post('/get-chatfromGroup', authnticateUser, chatController.getChatFromGroup);
module.exports = chatRouter;


