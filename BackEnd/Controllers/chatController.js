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
        let chatlist = await ChatMembersData.findAll({ where: { userDatumId: id } });
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
        console.log(phone_number)
        let memberId = await user.findOne({
            where: {
                phoneNO: phone_number
            }
        });
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
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A');
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
        const userId = parseInt(req.user.id);
        const memberId = parseInt(req.body.memberId);
        let chatListFirstCondition = await chatStorageDb.findAll({
            where: {
                recipeintId: memberId,
                userDatumId: userId
            },
            order: [['date', 'DESC']],
            limit: 5
        });

        let chatListSecondCondition = await chatStorageDb.findAll({
            where: {
                recipeintId: userId,
                userDatumId: memberId
            },
            order: [['date', 'DESC']],
            limit: 5
        });

        let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition);
        combinedChatList.sort((a, b) => {
            const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
            const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
            return dateA - dateB;
        });

        res.status(200).json(combinedChatList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


