const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const ChatGroupMembersData = sequelize.define('ChatGroupMembersData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        defaultValue: 'many'
    }
});
module.exports = ChatGroupMembersData;