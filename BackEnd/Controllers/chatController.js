const path = require('path');
const ChatMembersData = require('../Models/chatMembersModel');
const user = require('../Models/UserModel');
const chatStorageDb = require('../Models/chatStorageModel');
const moment = require("moment/moment");
module.exports.getMain = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'ChatMain.html'));
}

module.exports.getChatList = async (req, res) => {
    const id = req.user.id;
    try {
        let chatlist = await ChatMembersData.findAll({ userDatumId: id });
        if (!chatlist) {
            throw new Error("No chats found");
        }
        return res.status(201).json(chatlist);
    } catch (error) {
        console.log(error)
    }
}
module.exports.addContact = async (req, res) => {
    try {
        const id = req.user.id;
        const contact_name = req.body.data.name;
        const phone_number = req.body.data.phone_number;
        let memberId = await user.findOne({ phoneNO: phone_number });
        let parsedMemberId = parseInt(memberId.id);
        await ChatMembersData.create({
            ContactName: contact_name,
            memberId: parsedMemberId,
            userDatumId: id
        })
    } catch (error) {
        console.log(error)
    }
}
module.exports.addMessage = async (req, res) => {
    try {
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm A');
        const messageText = req.body.data.messageText;
        const memberId = parseInt(req.body.data.memberId);
        const senderId = req.user.id;
        console.log(req.body)
        await chatStorageDb.create({
            recipeintId: memberId,
            messageText: messageText,
            date: currentDateTime,
            userDatumId: senderId
        })
        res.status(201).json('success');
    } catch (error) {
        console.log(error)
    }
}

module.exports.getChat = async (req, res) => {
    try {

    } catch (error) {

    }
}