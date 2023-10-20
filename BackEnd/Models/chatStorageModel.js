const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");

const chatStorageDb = sequelize.define('chatStorage', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipeintId: {
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

module.exports = chatStorageDb;