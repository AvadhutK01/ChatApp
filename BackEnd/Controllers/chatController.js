const path = require('path');
const ChatMembersData = require('../Models/chatMembersModel');
const user = require('../Models/UserModel');
const chatStorageDb = require('../Models/chatStorageModel');
const cron = require('cron');
const { Op } = require('sequelize');
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
const ArchiveChatGroupFileModal = require('../Models/archiveChatGroupFileModal');
const ArchiveChatMemberFileModal = require('../Models/archievChatMemberFileModal');
const ArchiveGroupchatStorageDb = require('../Models/archiveChatGroupDataStorage');
const ArchivechatStorageDb = require('../Models/archiveChatStorageModel');
module.exports.getChatList = async (req, res) => {
    const t = await sequelize.transaction();
    const id = req.user.id;
    try {
        let chatlist = await ChatMembersData.findAll({ where: { userDatumId: id }, transaction: t });
        let grouplist = await ChatGroupMembersData.findAll({ where: { userDatumId: id }, transaction: t });

        if (!chatlist && !grouplist) {
            throw new Error("No chats found");
        }

        let chatPromises = chatlist.map(async item => {
            const memberId = item.memberId;
            const memberProfile = await user.findOne({ where: { id: memberId }, attributes: ['profiePicture'], transaction: t });
            return {
                id: item.id,
                name: item.ContactName,
                userDatumId: item.userDatumId,
                memberId: item.memberId,
                type: item.type,
                isMessage: item.isMessage,
                profiePicture: memberProfile.profiePicture
            };
        });

        const groupPromises = grouplist.map(async item => {
            const groupnameId = item.GroupNameDatumId;
            const groupNameData = await GroupNameData.findOne({
                where: { id: groupnameId },
                attributes: ['GroupName', 'profiePicture']
                , transaction: t
            });

            const groupMembersData = await ChatGroupMembersData.findAll({
                where: { GroupNameDatumId: groupnameId },
                attributes: ['userDatumId', 'isMessage'], transaction: t
            });

            const users = groupMembersData.map(member => ({
                userDatumId: member.userDatumId,
                isMessage: member.isMessage
            }));

            return {
                id: item.id,
                name: groupNameData.GroupName,
                userDatumId: item.userDatumId,
                memberId: item.GroupNameDatumId,
                isMessage: users,
                type: item.type,
                profiePicture: groupNameData.profiePicture
            };
        });
        let resolvedChatList = await Promise.all(chatPromises);
        let resolvedGroups = await Promise.all(groupPromises);
        let combinedList = resolvedChatList.concat(resolvedGroups);
        t.commit();
        return res.status(201).json(combinedList);
    } catch (error) {
        t.rollback();
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports.addContact = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.user.id;
        const userPhonNO = req.user.phoneNO;
        const contact_name = req.body.data.name;
        const phone_number = req.body.data.phone_number;
        let memberId = await user.findOne({
            where: {
                phoneNO: phone_number
            }, transaction: t
        });
        let parsedMemberId = parseInt(memberId.id);
        const result1Promise = ChatMembersData.create({
            id: getRandomInt(100000, 999999),
            ContactName: contact_name,
            memberId: parsedMemberId,
            userDatumId: id
        });
        const result2Promise = ChatMembersData.create({
            id: getRandomInt(100000, 999999),
            ContactName: userPhonNO,
            memberId: id,
            userDatumId: parsedMemberId
        });
        const [result1, result2] = await Promise.all([result1Promise, result2Promise]);
        const profilePictureforresult1 = await user.findOne({ where: { id: parsedMemberId }, transaction: t });
        const profilePictureforresult2 = await user.findOne({ where: { id: id }, transaction: t });
        result1.dataValues.profilePicture = profilePictureforresult1.profiePicture;
        result2.dataValues.profilePicture = profilePictureforresult2.profiePicture;
        const combinedResults = [result1, result2];
        t.commit();
        return res.status(201).json(combinedResults);
    } catch (error) {
        t.rollback();
        console.log(error)
    }
}
module.exports.addGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.user.id;
        const name = req.user.name;
        const group_name = req.body.Groupname;
        const file = req.file;
        const filename = req.file.originalname;
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
        const group = await GroupNameData.create({
            id: getRandomInt(100000, 999999),
            GroupName: group_name,
            profiePicture: s3Response.Location,
            userDatumId: id
        }, { transaction: t });
        const GroupId = group.id;
        const randomId = getRandomInt(100000, 999999)
        await ChatGroupMembersData.create({
            id: randomId,
            ContactName: name,
            isAdmin: true,
            userDatumId: id,
            GroupNameDatumId: GroupId
        }, { transaction: t });
        const responseArray = [{
            id: randomId,
            isMessage: [{
                userDatumId: id,
                isMessage: false
            }],
            memberId: GroupId,
            ContactName: group_name,
            profilePicture: s3Response.Location,
            type: "many",
            userDatumId: id
        }];
        t.commit();
        return res.status(201).json(responseArray);
    } catch (error) {
        t.rollback();
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports.performActionToGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const GroupId = parseInt(req.body.data.groupId);
        const MemberId = parseInt(req.body.data.memberId);
        const name = req.body.data.contactName;
        const action = req.body.data.action;
        const userId = req.user.id;
        const profilePicture = req.body.data.profilePicture;
        const groupName = req.body.data.groupName;
        const RandomId = getRandomInt(100000, 999999);
        if (action === 'addMember') {
            const result = await ChatGroupMembersData.create({
                id: RandomId,
                ContactName: name,
                userDatumId: MemberId,
                GroupNameDatumId: GroupId
            }, { transaction: t });
            const existingMembers = await ChatGroupMembersData.findAll({
                where: { GroupNameDatumId: GroupId },
                attributes: ['userDatumId', 'isMessage']
            });
            const isMessageArray = existingMembers.map(member => {
                return {
                    userDatumId: member.userDatumId,
                    isMessage: member.isMessage
                };
            });
            const responseObject = [{
                id: RandomId,
                isMessage: isMessageArray,
                memberId: GroupId,
                ContactName: groupName,
                profilePicture: profilePicture,
                type: "many",
                userDatumId: MemberId
            }];
            t.commit()
            return res.status(201).json(responseObject);
        }

        if (action === 'removeMember') {
            await ChatGroupMembersData.destroy({ where: { userDatumId: MemberId, GroupNameDatumId: GroupId }, transaction: t });
            t.commit();
            return res.status(201).json({ message: "success" });
        }
        if (action === 'setAdmin') {
            await ChatGroupMembersData.update({ isAdmin: 1 }, { where: { userDatumId: MemberId, GroupNameDatumId: GroupId }, transaction: t })
            t.commit();
            return res.status(201).json({ message: "success" });
        }
        if (action === 'leaveGroup') {
            await ChatGroupMembersData.destroy({ where: { userDatumId: userId, GroupNameDatumId: GroupId }, transaction: t })
            t.commit();
            return res.status(201).send('Deleted');
        }
    } catch (error) {
        t.rollback();
        console.log(error)
        return res.status(500).send("Server error");
    }
}

module.exports.performActionToContact = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const action = req.body.data.action;
        const MemberId = parseInt(req.body.data.memberId);
        const userId = req.user.id;
        if (action === 'saveContact') {
            const name = req.body.data.name;
            await ChatMembersData.update({ ContactName: name }, { where: { memberId: MemberId, userDatumId: userId }, transaction: t });
            t.commit();
            return res.status(201).send("Success");
        }
        else if (action === 'Deletecontact') {
            await ChatMembersData.destroy({ where: { memberId: MemberId, userDatumId: userId }, transaction: t })
            t.commit();
            return res.status(201).send('Deleted');
        }
    } catch (error) {
        t.rollback();
        console.log(error);
        return res.status(500).send("Server Error");
    }
}



module.exports.addMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const currentDateTime = req.body.data.currentDateTime;
        const messageText = req.body.data.messageText;
        const memberId = parseInt(req.body.data.memberId);
        const senderId = req.user.id;
        const id = getRandomInt(100000, 999999)
        await chatStorageDb.create({
            id: id,
            recipeintId: memberId,
            messageText: messageText,
            date: currentDateTime,
            userDatumId: senderId
        }, { transaction: t })
        await ChatMembersData.update({ isMessage: true }, { where: { userDatumId: memberId, memberId: senderId }, transaction: t })
        await ArchivechatStorageDb.create({
            id: id,
            recipeintId: memberId,
            messageText: messageText,
            date: currentDateTime,
            userDatumId: senderId
        }, { transaction: t })
        t.commit();
        return res.status(201).json('success');
    } catch (error) {
        t.rollback();
        console.log(error)
        return res.status(500).send("Server error")
    }
}

module.exports.addfile = async (req, res) => {
    const t = await sequelize.transaction();
    try {
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
        const id = getRandomInt(100000, 999999);
        await ChatMemberFileModal.create({
            id: id,
            recipeintId: memberId,
            fileName: filename,
            fileUrl: s3Response.Location,
            date: currentDateTime,
            userDatumId: senderId
        })
        await ArchiveChatMemberFileModal.create({
            id: id,
            recipeintId: memberId,
            fileName: filename,
            fileUrl: s3Response.Location,
            date: currentDateTime,
            userDatumId: senderId
        })
        await ChatMembersData.update({ isMessage: true }, { where: { userDatumId: memberId, memberId: senderId } })
        return res.status(201).json({ fileUrl: s3Response.Location });
    } catch (error) {
        t.rollback();
        console.log(error)
        return res.status(500).send("Server error");
    }
}

module.exports.addMessageToGroup = async (req, res) => {
    try {
        const t = await sequelize.transaction();
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A');
        const messageText = req.body.data.messageText;
        const memberId = parseInt(req.body.data.memberId);
        const senderId = req.user.id;
        const id = getRandomInt(100000, 999999);
        const senderData = await ChatMembersData.findOne({
            where: { memberId: senderId },
            attributes: ['ContactName']
        });
        const senderName = senderData.ContactName;
        await GroupchatStorageDb.create({
            id: id,
            senderId: senderId,
            messageText: messageText,
            date: currentDateTime,
            GroupNameDatumId: memberId
        })
        await ArchiveGroupchatStorageDb.create({
            id: id,
            senderId: senderId,
            messageText: messageText,
            date: currentDateTime,
            GroupNameDatumId: memberId
        })
        await ChatGroupMembersData.update(
            { isMessage: true },
            {
                where: {
                    GroupNameDatumId: memberId,
                    userDatumId: { [Op.ne]: senderId }
                }
            }
        );
        return res.status(201).json({ userName: senderName, memberId: senderId });
    } catch (error) {
        t.rollback();
        console.log(error)
        return res.status(500).send("Server error");
    }
}

module.exports.addfileToGroup = async (req, res) => {
    try {
        const t = await sequelize.transaction();
        const currentDateTime = req.body.currentDateTime;
        const filename = req.body.filename;
        const memberId = parseInt(req.body.memberId);
        const senderId = req.user.id;
        const file = req.file;
        const senderData = await ChatMembersData.findOne({
            where: { memberId: senderId },
            attributes: ['ContactName'],
            transaction: t
        });
        const senderName = senderData.ContactName;
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
        const id = getRandomInt(100000, 999999);
        await ChatGroupFileModal.create({
            id: id,
            senderId: senderId,
            fileName: filename,
            date: currentDateTime,
            fileUrl: s3Response.Location,
            GroupNameDatumId: memberId
        }, { transaction: t })
        await ChatGroupMembersData.update(
            { isMessage: true },
            {
                where: {
                    GroupNameDatumId: memberId,
                    userDatumId: { [Op.ne]: senderId }
                },
                transaction: t
            }
        );
        t.commit();
        return res.status(201).json({ fileUrl: s3Response.Location, userName: senderName, memberId: senderId });
    } catch (error) {
        t.rollback();
        console.log(error)
        return res.status(500).json('server error');
    }
}


module.exports.getChat = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = parseInt(req.user.id);
        const memberId = parseInt(req.body.memberId);
        const chatType = req.body.chatType;
        if (chatType == 'todayChat') {
            await ChatMembersData.update({ isMessage: false }, { where: { userDatumId: userId, memberId: memberId }, transaction: t })
            let chatListFirstCondition = await chatStorageDb.findAll({
                where: {
                    recipeintId: memberId,
                    userDatumId: userId
                },
                attributes: ['messageText', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            });

            let chatListSecondCondition = await chatStorageDb.findAll({
                where: {
                    recipeintId: userId,
                    userDatumId: memberId
                },
                attributes: ['messageText', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            });

            let chatListThirdCondition = await ChatMemberFileModal.findAll({
                where: {
                    recipeintId: memberId,
                    userDatumId: userId
                },
                attributes: ['fileName', 'fileUrl', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            })

            let chatListFourthCondition = await ChatMemberFileModal.findAll({
                where: {
                    recipeintId: userId,
                    userDatumId: memberId
                },
                attributes: ['fileName', 'fileUrl', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            })

            let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition).concat(chatListThirdCondition).concat(chatListFourthCondition);
            combinedChatList.sort((a, b) => {
                const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
                const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
                return dateA - dateB;
            });
            t.commit();
            return res.status(201).json(combinedChatList);
        }
        if (chatType == 'archiveChat') {
            let chatListFirstCondition = await ArchivechatStorageDb.findAll({
                where: {
                    recipeintId: memberId,
                    userDatumId: userId
                },
                attributes: ['messageText', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            });

            let chatListSecondCondition = await ArchivechatStorageDb.findAll({
                where: {
                    recipeintId: userId,
                    userDatumId: memberId
                },
                attributes: ['messageText', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            });

            let chatListThirdCondition = await ArchiveChatMemberFileModal.findAll({
                where: {
                    recipeintId: memberId,
                    userDatumId: userId
                },
                attributes: ['fileName', 'fileUrl', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            })

            let chatListFourthCondition = await ArchiveChatMemberFileModal.findAll({
                where: {
                    recipeintId: userId,
                    userDatumId: memberId
                },
                attributes: ['fileName', 'fileUrl', 'date', 'userDatumId', 'recipeintId']
                ,
                order: [['date', 'DESC']],
                transaction: t
            })

            let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition).concat(chatListThirdCondition).concat(chatListFourthCondition);
            combinedChatList.sort((a, b) => {
                const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
                const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
                return dateA - dateB;
            });
            t.commit();
            return res.status(201).json(combinedChatList);
        }
    } catch (error) {
        t.rollback();
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.getMembersList = async (req, res) => {
    const t = await sequelize.transaction();
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
                }, transaction: t
            });
            t.commit();
            return res.status(201).json(result);
        }
        if (action == 'removeMember') {
            const result = await ChatGroupMembersData.findAll({
                where: {
                    GroupNameDatumId: groupId
                },
                transaction: t
            })
            t.commit()
            return res.status(201).json(result)
        }
        if (action == 'setAdmin') {
            const result = await ChatGroupMembersData.findAll({
                where: {
                    GroupNameDatumId: groupId,
                    isAdmin: 0
                },
                transaction: t
            })
            t.commit()
            return res.status(201).json(result)
        }
    } catch (error) {
        t.rollback();
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.getChatFromGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const groupId = parseInt(req.body.groupId);
        const userId = parseInt(req.user.id);
        const chatType = req.body.chatType;
        await ChatGroupMembersData.update({ isMessage: false }, { where: { userDatumId: userId, GroupNameDatumId: groupId }, transaction: t })
        const userNamesData = await ChatMembersData.findAll({ where: { userDatumId: userId }, attributes: ['ContactName', 'memberId'], transaction: t });
        const userNamesMap = new Map(userNamesData.map(data => [data.memberId, data.ContactName]));
        const mapSenderIdToUserName = senderId => userNamesMap.get(senderId) || 'You';
        if (chatType == 'archiveChat') {
            let result1 = await ArchiveGroupchatStorageDb.findAll({
                where: {
                    GroupNameDatumId: groupId
                },
                order: [['date', 'DESC']],
                attributes: ['messageText', 'date', 'senderId', 'GroupNameDatumId'],
                transaction: t
            });

            let result2 = await ArchiveChatGroupFileModal.findAll({
                where: {
                    GroupNameDatumId: groupId
                },
                order: [['date', 'DESC']],
                attributes: ['fileName', 'fileUrl', 'date', 'senderId', 'GroupNameDatumId'],
                transaction: t
            });

            let isAdmin = await ChatGroupMembersData.findOne({
                where: {
                    userDatumId: userId,
                    GroupNameDatumId: groupId,
                    isAdmin: 1
                },
                attributes: ['isAdmin'],
                transaction: t
            });
            let result = result1.concat(result2)
            result = result.map(item => ({
                ...item.dataValues,
                userName: mapSenderIdToUserName(item.dataValues.senderId)
            }));
            result.sort((a, b) => {
                const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
                const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
                return dateA - dateB;
            });
            t.commit();
            return res.status(200).send({ isAdmin: isAdmin ? isAdmin.isAdmin : false, result: result });
        }
        if (chatType == 'todayChat') {
            let result1 = await GroupchatStorageDb.findAll({
                where: {
                    GroupNameDatumId: groupId
                },
                order: [['date', 'DESC']],
                attributes: ['messageText', 'date', 'senderId', 'GroupNameDatumId'],
                transaction: t
            });

            let result2 = await ChatGroupFileModal.findAll({
                where: {
                    GroupNameDatumId: groupId
                },
                order: [['date', 'DESC']],
                attributes: ['fileName', 'fileUrl', 'date', 'senderId', 'GroupNameDatumId'],
                transaction: t
            });

            let isAdmin = await ChatGroupMembersData.findOne({
                where: {
                    userDatumId: userId,
                    GroupNameDatumId: groupId,
                    isAdmin: 1
                },
                attributes: ['isAdmin'],
                transaction: t
            });
            let result = result1.concat(result2)
            result = result.map(item => ({
                ...item.dataValues,
                userName: mapSenderIdToUserName(item.dataValues.senderId)
            }))
            result.sort((a, b) => {
                const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
                const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
                return dateA - dateB;
            });
            t.commit();
            return res.status(200).send({ isAdmin: isAdmin ? isAdmin.isAdmin : false, result: result });
        }
    } catch (error) {
        t.rollback();
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.getLatestChat = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = parseInt(req.user.id);
        const memberId = parseInt(req.body.memberId);
        let chatListFirstCondition = await chatStorageDb.findAll({
            where: {
                recipeintId: memberId,
                userDatumId: userId
            },
            order: [['date', 'DESC']],
            transaction: t
        });

        let chatListSecondCondition = await chatStorageDb.findAll({
            where: {
                recipeintId: userId,
                userDatumId: memberId
            },
            order: [['date', 'DESC']],
            transaction: t
        });
        let chatListThirdCondition = await ChatMemberFileModal.findAll({
            where: {
                recipeintId: memberId,
                userDatumId: userId
            },
            order: [['date', 'DESC']],
            transaction: t
        })

        let chatListFourthCondition = await ChatMemberFileModal.findAll({
            where: {
                recipeintId: userId,
                userDatumId: memberId
            },
            order: [['date', 'DESC']],
            transaction: t
        })
        let chatListFifthCondition = await GroupchatStorageDb.findAll({
            where: {
                GroupNameDatumId: memberId
            },
            order: [['date', 'DESC']],
            transaction: t
        });
        let chatListSixthCondition = await ChatGroupFileModal.findAll({
            where: {
                GroupNameDatumId: memberId
            },
            order: [['date', 'DESC']],
            transaction: t
        });
        let combinedChatList = chatListFirstCondition.concat(chatListSecondCondition).concat(chatListThirdCondition).concat(chatListFourthCondition).concat(chatListFifthCondition).concat(chatListSixthCondition);
        combinedChatList.sort((a, b) => {
            const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
            const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
            return dateA - dateB;
        });
        t.commit();
        res.status(200).json(combinedChatList);
    } catch (error) {
        t.rollback();
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const cronSchedule = '0 0 * * *';
const cronJob = new cron.CronJob(cronSchedule, async () => {
    const t = await sequelize.transaction();
    try {
        const currentDate = moment().format('DD/MM/YYYY, hh:mm:ss A');
        await chatStorageDb.destroy({
            where: {
                date: {
                    [Op.ne]: currentDate
                }
            }, transaction: t
        });
        await ChatMemberFileModal.destroy({
            where: {
                date: {
                    [Op.ne]: currentDate
                }
            },
            transaction: t
        });
        await GroupchatStorageDb.destroy({
            where: {
                date: {
                    [Op.ne]: currentDate
                }
            },
            transaction: t
        });
        await ChatGroupFileModal.destroy({
            where: {
                date: {
                    [Op.ne]: currentDate
                }
            },
            transaction: t
        });
        t.commit()
        console.log('Cron job executed successfully.');
    } catch (error) {
        t.rollback();
        console.error('Error executing cron job:', error);
    }
}, null, true);
cronJob.start();

function getRandomInt(min, max) {
    const buffer = crypto.randomBytes(4);
    const randomNumber = buffer.readUInt32LE(0);
    return Math.floor(randomNumber / 0xFFFFFFFF * (max - min + 1) + min);
}