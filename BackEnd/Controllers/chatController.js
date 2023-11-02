const path = require('path');
const ChatMembersData = require('../Models/chatMembersModel');
const user = require('../Models/UserModel');
const chatStorageDb = require('../Models/chatStorageModel');
const moment = require("moment/moment");
const GroupNameData = require('../Models/chatGroupsModel');
const ChatGroupMembersData = require('../Models/chatGroupMembersModel');
const GroupchatStorageDb = require('../Models/chatGroupDataStorageModel');
const crypto = require('crypto');
const { Sequelize } = require('sequelize');
const sequelize = require('../dbConnect');
const ChatGroupFileModal = require('../Models/chatGroupFileModal');
const ChatMemberFileModal = require('../Models/chatMemberFileModal');
const AWS = require('aws-sdk');
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


module.exports.setStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = req.body.status;
        console.log(userId);
        console.log(status);
        await user.update({ lastSeen: status }, { where: { id: userId } });
    } catch (error) {
        console.log(error);
    }
}


module.exports.getStatus = async (req, res) => {
    try {
        const memberId = req.body.memberId;
        const result = await user.findOne({ where: { id: memberId }, attributes: ['lastSeen'] });
        return res.status(201).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

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
        const name = req.user.name;
        const group_name = req.body.data.Groupname;
        const group = await GroupNameData.create({
            id: getRandomInt(100000, 999999),
            GroupName: group_name,
            userDatumId: id
        })
        const GroupId = group.id;
        await ChatGroupMembersData.create({
            id: getRandomInt(100000, 999999),
            ContactName: name,
            isAdmin: true,
            userDatumId: id,
            GroupNameDatumId: GroupId
        })
        return res.status(201).json({ message: "Group Created" });
    } catch (error) {
        console.log(error)
    }
}

module.exports.performActionToGroup = async (req, res) => {
    try {
        const GroupId = parseInt(req.body.data.groupId);
        const MemberId = parseInt(req.body.data.memberId);
        const name = req.body.data.contactName;
        const action = req.body.data.action;
        const userId = req.user.id;
        if (action === 'addMember') {
            await ChatGroupMembersData.create({
                id: getRandomInt(100000, 999999),
                ContactName: name,
                userDatumId: MemberId,
                GroupNameDatumId: GroupId
            })
            return res.status(201).json({ message: "success" });
        }
        if (action === 'removeMember') {
            await ChatGroupMembersData.destroy({ where: { userDatumId: MemberId, GroupNameDatumId: GroupId } });
            return res.status(201).json({ message: "success" });
        }
        if (action === 'setAdmin') {
            await ChatGroupMembersData.update({ isAdmin: 1 }, { where: { userDatumId: MemberId, GroupNameDatumId: GroupId } })
            return res.status(201).json({ message: "success" });
        }
        if (action === 'leaveGroup') {
            await ChatGroupMembersData.destroy({ where: { userDatumId: userId, GroupNameDatumId: GroupId } })
            return res.status(201).send('Deleted');
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports.performActionToContact = async (req, res) => {
    try {
        const action = req.body.data.action;
        const MemberId = parseInt(req.body.data.memberId);
        const userId = req.user.id;
        if (action === 'saveContact') {
            const name = req.body.data.name;
            await ChatMembersData.update({ ContactName: name }, { where: { memberId: MemberId, userDatumId: userId } });
            return res.status(201).send("Success");
        }
        else if (action === 'Deletecontact') {
            await ChatMembersData.destroy({ where: { memberId: MemberId, userDatumId: userId } })
            return res.status(201).send('Deleted');
        }
    } catch (error) {
        console.log(error);
    }
}



module.exports.addMessage = async (req, res) => {
    try {
        const currentDateTime = req.body.data.currentDateTime;
        const messageText = req.body.data.messageText;
        const memberId = parseInt(req.body.data.memberId);
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

module.exports.addfile = async (req, res) => {
    try {
        // console.log(req.body);
        const currentDateTime = req.body.currentDateTime;
        const filename = req.body.filename;
        const memberId = parseInt(req.body.memberId);
        const senderId = req.user.id;
        const file = req.file;
        const s3 = new AWS.S3({
            accessKeyId: process.env.IAM_USER_KEY,
            secretAccessKey: process.env.IAM_USER_SECRET
        });
        const params = {
            Bucket: 'chatfilebucket',
            Key: filename,
            Body: file.buffer,
            ACL: 'public-read',
        };
        const s3Response = await s3.upload(params).promise();
        await ChatMemberFileModal.create({
            id: getRandomInt(100000, 999999),
            recipeintId: memberId,
            fileName: filename,
            fileUrl: s3Response.Location,
            date: currentDateTime,
            userDatumId: senderId
        })
        return res.status(201).json({ fileUrl: s3Response.Location });
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

module.exports.addfileToGroup = async (req, res) => {
    try {
        const currentDateTime = req.body.currentDateTime;
        const filename = req.body.filename;
        // console.log("object" + filename);
        const memberId = parseInt(req.body.memberId);
        const senderId = req.user.id;
        const file = req.file;
        const s3 = new AWS.S3({
            accessKeyId: process.env.IAM_USER_KEY,
            secretAccessKey: process.env.IAM_USER_SECRET
        });
        const params = {
            Bucket: 'chatfilebucket',
            Key: filename,
            Body: file.buffer,
            ACL: 'public-read',
        };
        // console.log(filename);
        const s3Response = await s3.upload(params).promise();
        await ChatGroupFileModal.create({
            id: getRandomInt(100000, 999999),
            senderId: senderId,
            fileName: filename,
            date: currentDateTime,
            fileUrl: s3Response.Location,
            GroupNameDatumId: memberId
        })
        return res.status(201).json({ fileUrl: s3Response.Location });
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
            attributes: ['messageText', 'date', 'userDatumId', 'recipeintId']
            ,
            order: [['date', 'DESC']],
            // limit: 5
        });

        let chatListSecondCondition = await chatStorageDb.findAll({
            where: {
                recipeintId: userId,
                userDatumId: memberId
            },
            attributes: ['messageText', 'date', 'userDatumId', 'recipeintId']
            ,
            order: [['date', 'DESC']],
            // limit: 5
        });

        let chatListThirdCondition = await ChatMemberFileModal.findAll({
            where: {
                recipeintId: memberId,
                userDatumId: userId
            },
            attributes: ['fileName', 'fileUrl', 'date', 'userDatumId', 'recipeintId']
            ,
            order: [['date', 'DESC']],
        })

        let chatListFourthCondition = await ChatMemberFileModal.findAll({
            where: {
                recipeintId: userId,
                userDatumId: memberId
            },
            attributes: ['fileName', 'fileUrl', 'date', 'userDatumId', 'recipeintId']
            ,
            order: [['date', 'DESC']],
        })

        let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition).concat(chatListThirdCondition).concat(chatListFourthCondition);
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
        const action = req.body.action;
        const userId = parseInt(req.user.id);
        const groupId = parseInt(req.body.memberId);
        if (action == 'addMember') {
            const result = await ChatMembersData.findAll({
                where: {
                    userDatumId: userId,
                    memberId: {
                        [Sequelize.Op.notIn]: sequelize.literal(`(SELECT userDatumId FROM ChatGroupMembersData WHERE GroupNameDatumId = ${groupId})`)
                    }
                }
            });
            return res.status(201).json(result);
        }
        if (action == 'removeMember') {
            const result = await ChatGroupMembersData.findAll({
                where: {
                    GroupNameDatumId: groupId
                }
            })
            return res.status(201).json(result)
        }
        if (action == 'setAdmin') {
            const result = await ChatGroupMembersData.findAll({
                where: {
                    GroupNameDatumId: groupId,
                    isAdmin: 0
                }
            })
            return res.status(201).json(result)
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports.getChatFromGroup = async (req, res) => {
    try {
        const groupId = parseInt(req.body.groupId);
        const userId = parseInt(req.user.id);

        let result1 = await GroupchatStorageDb.findAll({
            where: {
                GroupNameDatumId: groupId
            },
            order: [['date', 'DESC']],
            attributes: ['messageText', 'date', 'senderId', 'GroupNameDatumId'],
            // limit: 10
        });

        let result2 = await ChatGroupFileModal.findAll({
            where: {
                GroupNameDatumId: groupId
            },
            order: [['date', 'DESC']],
            attributes: ['fileName', 'fileUrl', 'date', 'senderId', 'GroupNameDatumId'],
            // limit: 10
        });

        let isAdmin = await ChatGroupMembersData.findOne({
            where: {
                userDatumId: userId,
                GroupNameDatumId: groupId,
                isAdmin: 1
            },
            attributes: ['isAdmin']
        });
        const result = result1.concat(result2)
        result.sort((a, b) => {
            const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
            const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
            return dateA - dateB;
        });
        res.status(200).send({ isAdmin: isAdmin ? isAdmin.isAdmin : false, result: result });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

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
        let chatListThirdCondition = await ChatMemberFileModal.findAll({
            where: {
                recipeintId: memberId,
                userDatumId: userId
            },
            order: [['date', 'DESC']],
            limit: 5
        })

        let chatListFourthCondition = await ChatMemberFileModal.findAll({
            where: {
                recipeintId: userId,
                userDatumId: memberId
            },
            order: [['date', 'DESC']],
            limit: 5
        })
        let chatListFifthCondition = await GroupchatStorageDb.findAll({
            where: {
                GroupNameDatumId: memberId
            },
            order: [['date', 'DESC']],
            limit: 5
        });
        let chatListSixthCondition = await ChatGroupFileModal.findAll({
            where: {
                GroupNameDatumId: memberId
            },
            order: [['date', 'DESC']],
            limit: 5
        });
        let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition).concat(chatListThirdCondition).concat(chatListFourthCondition).concat(chatListFifthCondition).concat(chatListSixthCondition);
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