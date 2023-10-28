const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const path = require('path');
const sequelize = require('./dbConnect');
const userRouter = require('./Routes/userRoutes');
const chatRouter = require('./Routes/chatRoute');
const user = require('./Models/UserModel');
const ChatMembersData = require('./Models/chatMembersModel');
const chatStorageDb = require('./Models/chatStorageModel');
const ChatGroupMembersData = require('./Models/chatGroupMembersModel');
const GroupNameData = require('./Models/chatGroupsModel');
const GroupchatStorageDb = require('./Models/chatGroupDataStorageModel');
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
user.hasMany(ChatMembersData);
ChatMembersData.belongsTo(user);
user.hasMany(chatStorageDb);
chatStorageDb.belongsTo(user);
user.hasMany(ChatGroupMembersData);
ChatGroupMembersData.belongsTo(user);
GroupNameData.hasMany(ChatGroupMembersData);
ChatGroupMembersData.belongsTo(GroupNameData);
user.hasMany(GroupNameData);
GroupNameData.belongsTo(user);
GroupNameData.hasMany(GroupchatStorageDb);
GroupchatStorageDb.belongsTo(GroupNameData);
app.use("/user", userRouter);
app.use('/chat', chatRouter);
app.use(express.static(path.join(__dirname, '..', 'FrontEnd', 'Public')));
sequelize.sync({ force: false }).then(() => app.listen(4000))