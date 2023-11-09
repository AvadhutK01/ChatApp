const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const ChatGroupMembersData = sequelize.define('ChatGroupMembersData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    ContactName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        defaultValue: 'many'
    },
    isMessage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});
module.exports = ChatGroupMembersData;