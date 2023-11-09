const userModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');
const sequelize = require("../dbConnect");
const jwt = require('jsonwebtoken');
const moment = require("moment/moment");
const crypto = require('crypto');
const AWS = require('aws-sdk');
module.exports.RegisterUser = async (req, res) => {
    const newName = req.body.name;
    const newPhoneNO = req.body.phoneNo;
    const newEmail = req.body.email;
    const newPasswordInput = req.body.password;
    const transaction = await sequelize.transaction();
    const file = req.file;
    const filename = req.file.originalname;
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.IAM_USER_KEY,
            secretAccessKey: process.env.IAM_USER_SECRET
        });
        const params = {
            Bucket: 'chatfilebucket',
            Key: filename,
            Body: file.buffer,
            ACL: 'public-read',
        };
        const s3Response = await s3.upload(params).promise();
        const hashedPassword = await bcrypt.hash(newPasswordInput, 10);
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm A');
        await userModel.create({
            id: getRandomInt(100000, 999999),
            name: newName,
            profiePicture: s3Response.Location,
            phoneNO: newPhoneNO,
            email: newEmail,
            password: hashedPassword,
            lastSeen: currentDateTime,
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: 'success' });
    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: 'exist' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports.verifyLogin = async (req, res) => {
    const phoneNO = req.body.phoneNo;
    const password = req.body.password;
    const t = await sequelize.transaction();
    try {
        let data = await userModel.findOne({
            where: {
                phoneNO: phoneNO
            },
            transaction: t
        });

        if (data) {
            const checkLogin = await bcrypt.compare(password, data.password);
            if (checkLogin) {
                await t.commit();
                res.status(201).json({ message: 'success', token: generateAccessToken(data.id) });
            } else {
                await t.rollback();
                res.status(401).json({ message: 'Failed' });
            }
        } else {
            await t.rollback();
            res.status(404).json({ message: 'NotExist' });
        }
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

function generateAccessToken(id) {
    return jwt.sign({ userid: id }, process.env.SECRETKEY);
}

function getRandomInt(min, max) {
    const buffer = crypto.randomBytes(4);
    const randomNumber = buffer.readUInt32LE(0);
    return Math.floor(randomNumber / 0xFFFFFFFF * (max - min + 1) + min);
}