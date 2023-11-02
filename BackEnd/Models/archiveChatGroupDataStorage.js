const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");

const ArchiveGroupchatStorageDb = sequelize.define('ArchiveGroupchatStorageDb', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    senderId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    messageText: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = ArchiveGroupchatStorageDb;