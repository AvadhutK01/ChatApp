const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
require('dotenv').config();
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
sequelize.sync({ force: false, logging: false }).then(() => {
    http.listen(4000, () => {
        console.log('Server listening on port 4000');
    });
})
io.on('connection', socket => {
    console.log('connected at' + socket.id)
    socket.on('send-message', (data) => {
        io.emit('receive-message', data);
        //io.to(data.recipeintId).emit('receive-message', data);
    })
})
