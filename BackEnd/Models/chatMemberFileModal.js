const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");

const ChatMemberFileModal = sequelize.define('ChatMemberFileDb', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    recipeintId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    fileName: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    fileUrl: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = ChatMemberFileModal;