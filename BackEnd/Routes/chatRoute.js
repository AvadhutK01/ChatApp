const express = require('express');
const chatRouter = express.Router();
const chatController = require('../Controllers/chatController');
const authnticateUser = require('../MiddleWares/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
chatRouter.get('/getChatList', authnticateUser, chatController.getChatList);
chatRouter.post('/add-contact', authnticateUser, chatController.addContact);
chatRouter.post('/add-group', authnticateUser, chatController.addGroup);
chatRouter.post('/add-message', authnticateUser, chatController.addMessage);
chatRouter.post('/add-file', authnticateUser, upload.single('file'), chatController.addfile);
chatRouter.post('/add-messagetoGroup', authnticateUser, chatController.addMessageToGroup);
chatRouter.post('/add-fileToGroup', authnticateUser, upload.single('file'), chatController.addfileToGroup);
chatRouter.post('/get-chat', authnticateUser, chatController.getChat);
chatRouter.post('/get-latestchat', authnticateUser, chatController.getLatestChat);
chatRouter.post('/getMembersList', authnticateUser, chatController.getMembersList);
chatRouter.post('/actionOnGroup', authnticateUser, chatController.performActionToGroup);
chatRouter.post('/get-chatfromGroup', authnticateUser, chatController.getChatFromGroup);
module.exports = chatRouter;


