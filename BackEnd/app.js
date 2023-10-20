const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const path = require('path');
const sequelize = require('./dbConnect');
const userRouter = require('./Routes/userRoutes');
const router = require('./Routes/indexRoute');
const chatRouter = require('./Routes/chatRoute');
const user = require('./Models/UserModel');
const ChatMembersData = require('./Models/chatMembersModel');
const chatStorageDb = require('./Models/chatStorageModel');
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST']
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
user.hasMany(ChatMembersData);
ChatMembersData.belongsTo(user);
user.hasMany(chatStorageDb);
chatStorageDb.belongsTo(user);
app.use(router);
app.use("/user", userRouter);
app.use('/chat', chatRouter);
app.use(express.static(path.join(__dirname, '..', 'FrontEnd', 'Public')));
sequelize.sync().then(() => app.listen(4000))