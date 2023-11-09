const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const ChatMembersData = sequelize.define('ChatMembersData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    memberId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ContactName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        defaultValue: 'one'
    },
    isMessage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});
module.exports = ChatMembersData;