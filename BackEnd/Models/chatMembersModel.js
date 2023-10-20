const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const ChatMembersData = sequelize.define('ChatMembersData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    memberId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ContactName: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
module.exports = ChatMembersData;