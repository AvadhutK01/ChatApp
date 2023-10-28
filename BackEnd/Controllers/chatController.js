const path = require('path');
const ChatMembersData = require('../Models/chatMembersModel');
const user = require('../Models/UserModel');
const chatStorageDb = require('../Models/chatStorageModel');
const moment = require("moment/moment");
const GroupNameData = require('../Models/chatGroupsModel');
const ChatGroupMembersData = require('../Models/chatGroupMembersModel');
const GroupchatStorageDb = require('../Models/chatGroupDataStorageModel');
const crypto = require('crypto');
module.exports.getMain = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'ChatMain.html'));
}

module.exports.getChatList = async (req, res) => {
    const id = req.user.id;
    try {
        let chatlist = await ChatMembersData.findAll({ where: { userDatumId: id } });
        let grouplist = await ChatGroupMembersData.findAll({ where: { userDatumId: id } });

        if (!chatlist && !grouplist) {
            throw new Error("No chats found");
        }

        chatlist = chatlist.map(item => {
            return {
                id: item.id,
                name: item.ContactName,
                userDatumId: item.userDatumId,
                memberId: item.memberId,
                type: item.type
            };
        });

        let groupPromises = grouplist.map(async item => {
            const groupnameId = item.GroupNameDatumId;
            let groupName = await GroupNameData.findAll({ where: { id: groupnameId }, attributes: ['GroupName'] });
            return {
                id: item.id,
                name: groupName[0].GroupName,
                userDatumId: item.userDatumId,
                memberId: item.GroupNameDatumId,
                type: item.type
            };
        });

        let resolvedGroups = await Promise.all(groupPromises);
        let combinedList = chatlist.concat(resolvedGroups);

        return res.status(201).json(combinedList);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports.addContact = async (req, res) => {
    try {
        const id = req.user.id;
        const userPhonNO = req.user.phoneNO;
        const contact_name = req.body.data.name;
        const phone_number = req.body.data.phone_number;
        let memberId = await user.findOne({
            where: {
                phoneNO: phone_number
            }
        });
        let parsedMemberId = parseInt(memberId.id);
        await ChatMembersData.create({
            id: getRandomInt(100000, 999999),
            ContactName: contact_name,
            memberId: parsedMemberId,
            userDatumId: id
        })
        await ChatMembersData.create({
            id: getRandomInt(100000, 999999),
            ContactName: userPhonNO,
            memberId: id,
            userDatumId: parsedMemberId
        })
        return res.status(201).json({ message: "contact added" });
    } catch (error) {
        console.log(error)
    }
}
module.exports.addGroup = async (req, res) => {
    try {
        const id = req.user.id;
        const group_name = req.body.data.Groupname;
        const group = await GroupNameData.create({
            id: getRandomInt(100000, 999999),
            GroupName: group_name,
            userDatumId: id
        })
        const GroupId = group.id;
        await ChatGroupMembersData.create({
            id: getRandomInt(100000, 999999),
            userDatumId: id,
            GroupNameDatumId: GroupId
        })
        return res.status(201).json({ message: "Group Created" });
    } catch (error) {
        console.log(error)
    }
}

module.exports.addMemberToGroup = async (req, res) => {
    try {
        const GroupId = parseInt(req.body.data.groupId);
        const MemberId = parseInt(req.body.data.memberId);
        await ChatGroupMembersData.create({
            id: getRandomInt(100000, 999999),
            userDatumId: MemberId,
            GroupNameDatumId: GroupId
        })
        return res.status(201).json({ message: "Group Created" });
    } catch (error) {
        console.log(error)
    }
}

module.exports.addMessage = async (req, res) => {
    try {
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A');
        const messageText = req.body.data.messageText;
        const memberId = parseInt(req.body.data.memberId);
        // console.log(memberId)
        const senderId = req.user.id;
        await chatStorageDb.create({
            id: getRandomInt(100000, 999999),
            recipeintId: memberId,
            messageText: messageText,
            date: currentDateTime,
            userDatumId: senderId
        })
        return res.status(201).json('success');
    } catch (error) {
        console.log(error)
    }
}

module.exports.addMessageToGroup = async (req, res) => {
    try {
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A');
        const messageText = req.body.data.messageText;
        const memberId = parseInt(req.body.data.memberId);
        const senderId = req.user.id;
        console.log(memberId)
        console.log(senderId)
        console.log(messageText)
        await GroupchatStorageDb.create({
            id: getRandomInt(100000, 999999),
            senderId: senderId,
            messageText: messageText,
            date: currentDateTime,
            GroupNameDatumId: memberId
        })
        return res.status(201).json('success');
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
        return res.status(201).json(combinedChatList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.getMembersList = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const result = await ChatMembersData.findAll({ where: { userDatumId: userId } });
        res.status(201).json(result);
    } catch (error) {
        console.log(error);
    }
}

module.exports.getChatFromGroup = async (req, res) => {
    try {
        const groupId = parseInt(req.body.groupId);
        let result = await GroupchatStorageDb.findAll({
            where: {
                GroupNameDatumId: groupId
            },
            order: [['date', 'DESC']],
            limit: 10
        });
        result.sort((a, b) => {
            const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
            const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
            return dateA - dateB;
        });
        res.status(200).send(result);
    } catch (error) {
        console.log(error)
    }
}
module.exports.getLatestChat = async (req, res) => {
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
        let chatListThirdCondition = await GroupchatStorageDb.findAll({
            where: {
                GroupNameDatumId: memberId
            },
            order: [['date', 'DESC']],
            limit: 5
        });
        let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition).concat(chatListThirdCondition);
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
function getRandomInt(min, max) {
    const buffer = crypto.randomBytes(4);
    const randomNumber = buffer.readUInt32LE(0);
    return Math.floor(randomNumber / 0xFFFFFFFF * (max - min + 1) + min);
}
// const Group = await GroupNameData.findOne({ where: { GroupName: group_name }, attributes: ['id'] });