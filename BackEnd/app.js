const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const io = require('socket.io')(app.listen(4000), {
    cors: true
});
const cors = require('cors');
const path = require('path');
const sequelize = require('./dbConnect');
const userRouter = require('./Routes/userRoutes');
const chatRouter = require('./Routes/chatRoute');
const user = require('./Models/UserModel');
const ChatMembersData = require('./Models/chatMembersModel');
const chatStorageDb = require('./Models/chatStorageModel');
const ChatGroupMembersData = require('./Models/chatGroupMembersModel');
const GroupchatStorageDb = require('./Models/chatGroupDataStorageModel');
const GroupNameData = require('./Models/chatGroupsModel');
const ChatGroupFileModal = require('./Models/chatGroupFileModal');
const ChatMemberFileModal = require('./Models/chatMemberFileModal');
const ArchiveChatGroupFileModal = require('./Models/archiveChatGroupFileModal');
const ArchiveGroupchatStorageDb = require('./Models/archiveChatGroupDataStorage');
const ArchivechatStorageDb = require('./Models/archiveChatStorageModel');
const ArchiveChatMemberFileModal = require('./Models/archievChatMemberFileModal');
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
user.hasMany(ChatMembersData);
ChatMembersData.belongsTo(user);
user.hasMany(chatStorageDb);
chatStorageDb.belongsTo(user);
user.hasMany(ArchiveGroupchatStorageDb);
ArchivechatStorageDb.belongsTo(user);
user.hasMany(ChatMemberFileModal);
ChatMemberFileModal.belongsTo(user);
user.hasMany(ArchiveChatMemberFileModal);
ArchiveChatMemberFileModal.belongsTo(user)
user.hasMany(ChatGroupMembersData);
ChatGroupMembersData.belongsTo(user);
GroupNameData.hasMany(ChatGroupMembersData);
ChatGroupMembersData.belongsTo(GroupNameData);
user.hasMany(GroupNameData);
GroupNameData.belongsTo(user);
GroupNameData.hasMany(GroupchatStorageDb);
GroupchatStorageDb.belongsTo(GroupNameData);
GroupNameData.hasMany(ArchiveGroupchatStorageDb)
ArchiveGroupchatStorageDb.belongsTo(GroupNameData)
GroupNameData.hasMany(ChatGroupFileModal);
ChatGroupFileModal.belongsTo(GroupNameData);
GroupNameData.hasMany(ArchiveChatGroupFileModal);
ArchiveChatGroupFileModal.belongsTo(GroupNameData);
app.use("/user", userRouter);
app.use('/chat', chatRouter);
app.use(express.static(path.join(__dirname, '..', 'FrontEnd', 'Public')));
sequelize.sync({ force: false, logging: false }).then(() => {
    console.log('Server listening on port 4000');
});
io.on('connection', socket => {
    console.log('connected at' + socket.id);
    socket.on('send-message', (data) => {
        io.emit('receive-message', data);
    });
    socket.on('send-file', (data) => {
        io.emit('receive-file', data);
    });
    socket.on('newMember', (data => {
        io.emit('addNewUser', data);
    }))
    socket.on('setAdmin', (data => {
        io.emit('setAdmin', data);
    }))
    socket.on('removeMember', (data => {
        io.emit('removeMember', data);
    }))
    socket.on('setMessagefalse', (data => {
        io.emit('setMessagefalse', data);
    }))
});